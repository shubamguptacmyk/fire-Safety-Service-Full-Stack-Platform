import { Order } from "../models/Order";
import { User } from "../models/User";
import { Quote } from "../models/Quote";
import { AMCContract } from "../models/AMCContract";
import { ServiceBooking } from "../models/ServiceBooking";
import { Product } from "../models/Product";

export class DashboardService {
  static async getOverview() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      revenueStats,
      orderStatusCounts,
      totalCustomers,
      newCustomers30d,
      quoteStatusCounts,
      amcActiveCount,
      amcExpiringCount,
      serviceStatusCounts,
      lowStockProducts,
      recentOrders,
      recentBookings,
      recentQuotes,
      dailyTrend,
    ] = await Promise.all([
      // 1. Total revenue & orders count
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$pricing.grandTotal", 0],
              },
            },
            totalOrders: { $sum: 1 },
            paidOrders: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
            },
          },
        },
      ]),

      // 2. Orders grouped by status
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // 3. Customer counts
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "customer", createdAt: { $gte: thirtyDaysAgo } }),

      // 4. Quotes grouped by status
      Quote.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // 5. AMC active & expiring soon
      AMCContract.countDocuments({ status: "Active" }),
      AMCContract.countDocuments({
        status: "Active",
        endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gte: new Date() },
      }),

      // 6. Service bookings grouped by status
      ServiceBooking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // 7. Low stock products (stock <= 5 or stock <= lowStockThreshold)
      Product.find({
        $or: [{ stock: { $lte: 5 } }, { $expr: { $lte: ["$stock", "$lowStockThreshold"] } }],
        isActive: true,
      })
        .select("name SKU stock lowStockThreshold price brand")
        .limit(10),

      // 8. Recent orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("orderNumber customer pricing status paymentStatus paymentMethod createdAt"),

      // 9. Recent bookings
      ServiceBooking.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("bookingId serviceType customerName phone status preferredDate cost"),

      // 10. Recent quotes
      Quote.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select("quoteNumber customer pricing status validUntil createdAt"),

      // 11. Daily revenue and orders for last 30 days
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$pricing.grandTotal" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const rev = revenueStats[0] || { totalRevenue: 0, totalOrders: 0, paidOrders: 0 };

    const orderStatusMap: Record<string, number> = {};
    orderStatusCounts.forEach((s) => {
      orderStatusMap[s._id] = s.count;
    });

    const quoteStatusMap: Record<string, number> = {};
    quoteStatusCounts.forEach((s) => {
      quoteStatusMap[s._id] = s.count;
    });

    const serviceStatusMap: Record<string, number> = {};
    serviceStatusCounts.forEach((s) => {
      serviceStatusMap[s._id] = s.count;
    });

    return {
      kpis: {
        totalRevenue: Math.round(rev.totalRevenue * 100) / 100,
        totalOrders: rev.totalOrders,
        paidOrders: rev.paidOrders,
        totalCustomers,
        newCustomers30d,
        activeAMC: amcActiveCount,
        expiringAMC30d: amcExpiringCount,
        lowStockCount: lowStockProducts.length,
      },
      ordersByStatus: orderStatusMap,
      quotesByStatus: quoteStatusMap,
      servicesByStatus: serviceStatusMap,
      recentOrders,
      recentBookings,
      recentQuotes,
      lowStockProducts,
      dailyTrend,
    };
  }

  static async getSummary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
      totalRevAgg,
      todayRevAgg,
      monthRevAgg,
      totalOrders,
      pendingOrders,
      totalCustomers,
      activeAMC,
      expiringAMC,
      pendingServices,
      openQuotes,
      lowStockCount,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$pricing.grandTotal" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending", "confirmed", "processing"] } }),
      User.countDocuments({ role: "customer" }),
      AMCContract.countDocuments({ status: "Active" }),
      AMCContract.countDocuments({ status: "Active", endDate: { $lte: thirtyDaysFromNow, $gte: new Date() } }),
      ServiceBooking.countDocuments({ status: { $in: ["Requested", "Confirmed", "Assigned", "In Progress"] } }),
      Quote.countDocuments({ status: { $in: ["submitted", "under_review", "quoted"] } }),
      Product.countDocuments({
        isActive: true,
        $or: [{ stock: { $lte: 5 } }, { $expr: { $lte: ["$stock", "$lowStockThreshold"] } }],
      }),
    ]);

    return {
      totalRevenue: Math.round((totalRevAgg[0]?.total || 0) * 100) / 100,
      todayRevenue: Math.round((todayRevAgg[0]?.total || 0) * 100) / 100,
      thisMonthRevenue: Math.round((monthRevAgg[0]?.total || 0) * 100) / 100,
      totalOrders,
      pendingOrders,
      totalCustomers,
      activeAMC,
      expiringAMC30d: expiringAMC,
      pendingServices,
      openQuotes,
      lowStockCount,
    };
  }

  static async getRevenue(params: { period?: string; startDate?: string; endDate?: string } = {}) {
    let start: Date;
    const end = params.endDate ? new Date(params.endDate) : new Date();

    if (params.startDate) {
      start = new Date(params.startDate);
    } else {
      const period = params.period || "30d";
      const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
      start = new Date();
      start.setDate(start.getDate() - days);
    }

    const [timeline, paymentMethods, paymentStatuses, totals] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, paymentStatus: "paid" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$pricing.grandTotal" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: "$paymentMethod",
            revenue: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$pricing.grandTotal", 0] },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: "$paymentStatus",
            count: { $sum: 1 },
            amount: { $sum: "$pricing.grandTotal" },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.grandTotal" },
            paidOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = totals[0]?.totalRevenue || 0;
    const paidOrders = totals[0]?.paidOrders || 0;
    const averageOrderValue = paidOrders > 0 ? Math.round((totalRevenue / paidOrders) * 100) / 100 : 0;

    return {
      period: params.period || "custom",
      startDate: start,
      endDate: end,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      paidOrders,
      averageOrderValue,
      timeline,
      paymentMethods,
      paymentStatuses,
    };
  }

  static async getOrders(params: { startDate?: string; endDate?: string } = {}) {
    const filter: Record<string, any> = {};
    if (params.startDate || params.endDate) {
      filter.createdAt = {};
      if (params.startDate) filter.createdAt.$gte = new Date(params.startDate);
      if (params.endDate) filter.createdAt.$lte = new Date(params.endDate);
    }

    const [statusBreakdown, recentOrders, totalOrders] = await Promise.all([
      Order.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$pricing.grandTotal" } } },
      ]),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber customer pricing status paymentStatus paymentMethod createdAt"),
      Order.countDocuments(filter),
    ]);

    const deliveredCount = statusBreakdown.find((s) => s._id === "delivered")?.count || 0;
    const cancelledCount = statusBreakdown.find((s) => s._id === "cancelled")?.count || 0;

    return {
      totalOrders,
      fulfillmentRate: totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0,
      cancellationRate: totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0,
      statusBreakdown,
      recentOrders,
    };
  }

  static async getCustomers() {
    const [byType, verifiedCounts, topCustomers, monthlyAcquisition] = await Promise.all([
      User.aggregate([
        { $match: { role: "customer" } },
        { $group: { _id: "$customerType", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { role: "customer" } },
        { $group: { _id: "$isEmailVerified", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: "$customer.userId",
            name: { $first: "$customer.name" },
            email: { $first: "$customer.email" },
            phone: { $first: "$customer.phone" },
            totalSpent: { $sum: "$pricing.grandTotal" },
            ordersCount: { $sum: 1 },
            lastOrderDate: { $max: "$createdAt" },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
      ]),
      User.aggregate([
        { $match: { role: "customer" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

    return {
      byType,
      verifiedCounts,
      topCustomers,
      monthlyAcquisition,
    };
  }

  static async getProducts() {
    const [topSelling, lowStock, outOfStock, totalActive, totalInactive] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            productName: { $first: "$items.name" },
            totalQuantitySold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" },
          },
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: 10 },
      ]),
      Product.find({
        isActive: true,
        $or: [{ stock: { $lte: 5 } }, { $expr: { $lte: ["$stock", "$lowStockThreshold"] } }],
      })
        .select("name SKU stock lowStockThreshold price brand category")
        .limit(20),
      Product.find({ isActive: true, stock: 0 })
        .select("name SKU price brand category")
        .limit(20),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
    ]);

    return {
      totalActive,
      totalInactive,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      topSelling,
      lowStockProducts: lowStock,
      outOfStockProducts: outOfStock,
    };
  }

  static async getServices() {
    const [statusBreakdown, typeBreakdown, recentBookings, totalBookings] = await Promise.all([
      ServiceBooking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ServiceBooking.aggregate([
        { $group: { _id: "$serviceType", count: { $sum: 1 }, totalCost: { $sum: "$cost" } } },
      ]),
      ServiceBooking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("bookingId serviceType customerName phone status preferredDate cost"),
      ServiceBooking.countDocuments(),
    ]);

    return {
      totalBookings,
      statusBreakdown,
      typeBreakdown,
      recentBookings,
    };
  }

  static async getAMC() {
    const now = new Date();
    const in30d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const in60d = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const in90d = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const [
      statusBreakdown,
      expiring30d,
      expiring60d,
      expiring90d,
      financials,
      formBCertificatesCount,
      recentContracts,
    ] = await Promise.all([
      AMCContract.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, totalValue: { $sum: "$annualValue" } } },
      ]),
      AMCContract.countDocuments({ status: "Active", endDate: { $gte: now, $lte: in30d } }),
      AMCContract.countDocuments({ status: "Active", endDate: { $gte: now, $lte: in60d } }),
      AMCContract.countDocuments({ status: "Active", endDate: { $gte: now, $lte: in90d } }),
      AMCContract.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: null, totalAnnualValue: { $sum: "$annualValue" } } },
      ]),
      AMCContract.countDocuments({
        $or: [
          { formBCertificateUrl: { $exists: true, $ne: null } },
          { formBNumber: { $exists: true, $ne: null } },
        ],
      }),
      AMCContract.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("contractNumber clientName companyName location status startDate endDate annualValue formBStatus"),
    ]);

    return {
      annualContractValue: financials[0]?.totalAnnualValue || 0,
      formBCertificatesCount,
      expiringInDays: {
        within30Days: expiring30d,
        within60Days: expiring60d,
        within90Days: expiring90d,
      },
      statusBreakdown,
      recentContracts,
    };
  }
}
