import { Types } from "mongoose";
import { Order } from "../models/Order";
import { ServiceBooking } from "../models/ServiceBooking";
import { AMCContract } from "../models/AMCContract";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { User } from "../models/User";

export interface ReportFilter {
  startDate?: string | Date;
  endDate?: string | Date;
  category?: string;
  product?: string;
  customer?: string;
  status?: string;
}

export type DateFilter = ReportFilter;

export class ReportService {
  static async getSalesReport(filter: ReportFilter) {
    const match: any = {};
    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) match.createdAt.$gte = new Date(filter.startDate);
      if (filter.endDate) match.createdAt.$lte = new Date(filter.endDate);
    }

    const [summary, byPaymentMethod, byStatus, dailyBreakdown] = await Promise.all([
      // Overall Summary
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$pricing.grandTotal", 0] },
            },
            totalSubtotal: { $sum: "$pricing.subtotal" },
            totalTax: { $sum: "$pricing.gst" },
            totalDiscount: { $sum: "$pricing.discount" },
            totalShipping: { $sum: "$pricing.shippingFee" },
            paidOrdersCount: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
            },
          },
        },
      ]),

      // By Payment Method
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            totalAmount: { $sum: "$pricing.grandTotal" },
          },
        },
      ]),

      // By Status
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$pricing.grandTotal" },
          },
        },
      ]),

      // Daily breakdown
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            revenue: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$pricing.grandTotal", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const s = summary[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalSubtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      totalShipping: 0,
      paidOrdersCount: 0,
    };

    const averageOrderValue = s.paidOrdersCount > 0 ? Math.round(s.totalRevenue / s.paidOrdersCount) : 0;

    return {
      summary: {
        ...s,
        averageOrderValue,
      },
      byPaymentMethod,
      byStatus,
      dailyBreakdown,
    };
  }

  static async getServicesReport(filter: DateFilter) {
    const match: any = {};
    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) match.createdAt.$gte = new Date(filter.startDate);
      if (filter.endDate) match.createdAt.$lte = new Date(filter.endDate);
    }

    const [byType, byStatus, technicianWorkload] = await Promise.all([
      ServiceBooking.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$serviceType",
            count: { $sum: 1 },
            totalRevenue: { $sum: { $ifNull: ["$cost.total", 0] } },
          },
        },
      ]),

      ServiceBooking.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      ServiceBooking.aggregate([
        {
          $match: {
            ...match,
            assignedTechnician: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$assignedTechnician",
            technicianName: { $first: "$assignedTechnicianName" },
            assignedCount: { $sum: 1 },
            completedCount: {
              $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    return {
      byType,
      byStatus,
      technicianWorkload,
    };
  }

  static async getAMCReport() {
    const [statusBreakdown, formBBreakdown, expiringSoon] = await Promise.all([
      AMCContract.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      AMCContract.aggregate([
        {
          $group: {
            _id: "$formBStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      AMCContract.find({
        status: "Active",
        endDate: { $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), $gte: new Date() },
      })
        .select("contractNumber clientName companyName phone endDate formBStatus")
        .sort({ endDate: 1 }),
    ]);

    return {
      statusBreakdown,
      formBBreakdown,
      expiringSoon,
    };
  }

  static async getInventoryReport() {
    const [metrics, lowStock, outOfStock] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalUnitsInStock: { $sum: "$stock" },
            totalValuation: { $sum: { $multiply: ["$stock", "$price"] } },
          },
        },
      ]),

      Product.find({
        $or: [{ stock: { $lte: 5 } }, { $expr: { $lte: ["$stock", "$lowStockThreshold"] } }],
        stock: { $gt: 0 },
        isActive: true,
      }).select("name SKU brand price stock lowStockThreshold"),

      Product.find({
        stock: { $lte: 0 },
        isActive: true,
      }).select("name SKU brand price stock"),
    ]);

    const m = metrics[0] || { totalProducts: 0, totalUnitsInStock: 0, totalValuation: 0 };

    return {
      overview: {
        totalProducts: m.totalProducts,
        totalUnitsInStock: m.totalUnitsInStock,
        totalValuation: Math.round(m.totalValuation * 100) / 100,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
      },
      lowStock,
      outOfStock,
    };
  }

  static async getRevenueReport(filter: ReportFilter) {
    const match: any = {};
    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) match.createdAt.$gte = new Date(filter.startDate);
      if (filter.endDate) match.createdAt.$lte = new Date(filter.endDate);
    }
    if (filter.status) match.paymentStatus = filter.status;
    else match.paymentStatus = "paid";
    if (filter.customer) match.user = new Types.ObjectId(filter.customer);

    const [summary, monthlyTimeline, methodBreakdown] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: "$pricing.grandTotal" },
            taxableRevenue: { $sum: "$pricing.subtotal" },
            gstCollected: { $sum: "$pricing.gst" },
            shippingCollected: { $sum: "$pricing.shippingFee" },
            discountsGiven: { $sum: "$pricing.discount" },
            paidOrdersCount: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$pricing.grandTotal" },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: "$pricing.grandTotal" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$paymentMethod",
            revenue: { $sum: "$pricing.grandTotal" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const s = summary[0] || {
      grossRevenue: 0,
      taxableRevenue: 0,
      gstCollected: 0,
      shippingCollected: 0,
      discountsGiven: 0,
      paidOrdersCount: 0,
    };

    return {
      summary: {
        ...s,
        avgOrderValue: s.paidOrdersCount > 0 ? Math.round(s.grossRevenue / s.paidOrdersCount) : 0,
      },
      monthlyTimeline,
      methodBreakdown,
    };
  }

  static async getProductsReport(filter: ReportFilter) {
    const match: any = { paymentStatus: "paid" };
    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) match.createdAt.$gte = new Date(filter.startDate);
      if (filter.endDate) match.createdAt.$lte = new Date(filter.endDate);
    }
    if (filter.customer) match.user = new Types.ObjectId(filter.customer);

    const pipeline: any[] = [
      { $match: match },
      { $unwind: "$items" },
    ];

    if (filter.product) {
      pipeline.push({
        $match: { "items.productId": new Types.ObjectId(filter.product) },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          sku: { $first: "$items.sku" },
          quantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          averagePrice: { $avg: "$items.price" },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 50 }
    );

    const topSelling = await Order.aggregate(pipeline);
    return {
      totalProductsAnalyzed: topSelling.length,
      topSelling,
    };
  }

  static async getCategoriesReport(filter: ReportFilter) {
    const match: any = { paymentStatus: "paid" };
    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) match.createdAt.$gte = new Date(filter.startDate);
      if (filter.endDate) match.createdAt.$lte = new Date(filter.endDate);
    }

    const [categorySales, categoryCounts] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "prod",
          },
        },
        { $unwind: "$prod" },
        {
          $lookup: {
            from: "categories",
            localField: "prod.category",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: "$cat" },
        {
          $group: {
            _id: "$cat._id",
            categoryName: { $first: "$cat.name" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.total" },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Category.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products",
          },
        },
        {
          $project: {
            name: 1,
            productCount: { $size: "$products" },
          },
        },
      ]),
    ]);

    return {
      categorySales,
      categories: categoryCounts,
    };
  }

  static async getCustomersReport(filter: ReportFilter) {
    const match: any = { role: "customer" };
    if (filter.startDate || filter.endDate) {
      match.createdAt = {};
      if (filter.startDate) match.createdAt.$gte = new Date(filter.startDate);
      if (filter.endDate) match.createdAt.$lte = new Date(filter.endDate);
    }
    if (filter.category) match.customerType = filter.category;

    const [typeDistribution, acquisitionTrend, topSpenders] = await Promise.all([
      User.aggregate([
        { $match: match },
        { $group: { _id: "$customerType", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: "$user",
            name: { $first: "$customer.name" },
            email: { $first: "$customer.email" },
            phone: { $first: "$customer.phone" },
            companyName: { $first: "$customer.companyName" },
            totalSpent: { $sum: "$pricing.grandTotal" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 20 },
      ]),
    ]);

    return {
      typeDistribution,
      acquisitionTrend,
      topSpenders,
    };
  }
}
