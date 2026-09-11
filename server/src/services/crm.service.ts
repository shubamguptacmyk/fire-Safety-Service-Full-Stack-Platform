import { Types } from "mongoose";
import { User, IUser } from "../models/User";
import { Order } from "../models/Order";
import { Quote } from "../models/Quote";
import { AMCContract } from "../models/AMCContract";
import { ServiceBooking } from "../models/ServiceBooking";
import { CustomerEquipment } from "../models/CustomerEquipment";
import { Address } from "../models/Address";
import { ApiError } from "../utils/ApiError";

export type CustomerTier = "Platinum" | "Gold" | "Silver" | "Bronze";

export function calculateCustomerTier(lifetimeSpend: number): CustomerTier {
  if (lifetimeSpend >= 200000) return "Platinum";
  if (lifetimeSpend >= 50000) return "Gold";
  if (lifetimeSpend >= 10000) return "Silver";
  return "Bronze";
}

export class CRMService {
  static async getCustomers(query: {
    search?: string;
    customerType?: string;
    tier?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const userFilter: any = { role: "customer" };

    if (query.customerType) {
      userFilter.customerType = query.customerType;
    }

    if (query.search) {
      const s = query.search.trim();
      userFilter.$or = [
        { name: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { companyName: { $regex: s, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(userFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(userFilter),
    ]);

    const userIds = users.map((u) => u._id);

    // Aggregate lifetime spend & order counts for these users
    const spendAgg = await Order.aggregate([
      {
        $match: {
          user: { $in: userIds },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: "$user",
          lifetimeSpend: { $sum: "$pricing.grandTotal" },
          totalOrders: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]);

    const spendMap = new Map<string, { lifetimeSpend: number; totalOrders: number; lastOrderDate?: Date }>();
    spendAgg.forEach((item) => {
      if (item._id) {
        spendMap.set(item._id.toString(), {
          lifetimeSpend: Math.round(item.lifetimeSpend),
          totalOrders: item.totalOrders,
          lastOrderDate: item.lastOrderDate,
        });
      }
    });

    const customers = users.map((u) => {
      const stats = spendMap.get(u._id.toString()) || { lifetimeSpend: 0, totalOrders: 0 };
      const tier = calculateCustomerTier(stats.lifetimeSpend);
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        customerType: u.customerType,
        companyName: u.companyName,
        gstNumber: u.gstNumber,
        tags: u.tags || [],
        notes: u.notes,
        isActive: u.isActive,
        registeredAt: u.createdAt,
        totalOrders: stats.totalOrders,
        lifetimeSpend: stats.lifetimeSpend,
        lastOrderDate: stats.lastOrderDate,
        tier,
      };
    });

    // If query.tier is passed, filter in-memory for the current page
    const filtered = query.tier ? customers.filter((c) => c.tier.toLowerCase() === query.tier!.toLowerCase()) : customers;

    return {
      customers: filtered,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  static async getCustomer360(customerId: string) {
    if (!Types.ObjectId.isValid(customerId)) {
      throw ApiError.badRequest("Invalid customer ID");
    }

    const user = await User.findById(customerId);
    if (!user) {
      throw ApiError.notFound("Customer not found");
    }

    const [addresses, orders, quotes, amcContracts, serviceBookings, equipment] = await Promise.all([
      Address.find({ user: customerId }),
      Order.find({ user: customerId }).sort({ createdAt: -1 }),
      Quote.find({ user: customerId }).sort({ createdAt: -1 }),
      AMCContract.find({ userId: customerId }).sort({ createdAt: -1 }),
      ServiceBooking.find({ userId: customerId }).sort({ createdAt: -1 }),
      CustomerEquipment.find({ userId: customerId }).sort({ nextInspectionDate: 1 }),
    ]);

    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const lifetimeSpend = paidOrders.reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);
    const tier = calculateCustomerTier(lifetimeSpend);

    return {
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        customerType: user.customerType,
        companyName: user.companyName,
        gstNumber: user.gstNumber,
        tags: user.tags || [],
        notes: user.notes,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      stats: {
        lifetimeSpend: Math.round(lifetimeSpend),
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        totalQuotes: quotes.length,
        activeAMCContracts: amcContracts.filter((a) => a.status === "Active").length,
        totalServiceBookings: serviceBookings.length,
        equipmentCount: equipment.length,
        tier,
      },
      addresses,
      orders,
      quotes,
      amcContracts,
      serviceBookings,
      equipment,
    };
  }

  static async updateCustomerNotesAndTags(customerId: string, input: { notes?: string; tags?: string[] }) {
    if (!Types.ObjectId.isValid(customerId)) {
      throw ApiError.badRequest("Invalid customer ID");
    }

    const update: any = {};
    if (typeof input.notes === "string") update.notes = input.notes;
    if (Array.isArray(input.tags)) update.tags = input.tags;

    const user = await User.findByIdAndUpdate(customerId, update, { new: true });
    if (!user) {
      throw ApiError.notFound("Customer not found");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      notes: user.notes,
      tags: user.tags,
    };
  }
}
