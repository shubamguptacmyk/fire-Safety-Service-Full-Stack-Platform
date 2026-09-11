import * as XLSX from "xlsx";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { ServiceBooking } from "../models/ServiceBooking";

export class ExportService {
  private static generateBuffer(data: any[], sheetName: string, format: "csv" | "xlsx"): Buffer {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, {
      type: "buffer",
      bookType: format === "csv" ? "csv" : "xlsx",
    }) as Buffer;
  }

  static async exportOrders(filter: any = {}, format: "csv" | "xlsx" = "xlsx"): Promise<Buffer> {
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    const rows = orders.map((o) => ({
      "Order Number": o.orderNumber,
      "Customer Name": o.customer?.name || "",
      "Customer Email": o.customer?.email || "",
      "Customer Phone": o.customer?.phone || "",
      "Company Name": o.customer?.companyName || "",
      "Order Status": o.status,
      "Payment Status": o.paymentStatus,
      "Payment Method": o.paymentMethod,
      "Items Count": o.items?.length || 0,
      "Subtotal (INR)": o.pricing?.subtotal || 0,
      "Discount (INR)": o.pricing?.discount || 0,
      "GST (INR)": o.pricing?.gst || 0,
      "Shipping (INR)": o.pricing?.shippingFee || 0,
      "Grand Total (INR)": o.pricing?.grandTotal || 0,
      "City": o.shippingAddress?.city || "",
      "State": o.shippingAddress?.state || "",
      "Created At": o.createdAt?.toISOString() || "",
    }));

    return this.generateBuffer(rows, "Orders", format);
  }

  static async exportCustomers(format: "csv" | "xlsx" = "xlsx"): Promise<Buffer> {
    const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 });

    // Aggregate lifetime spend per user
    const spendAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: "$user",
          totalSpend: { $sum: "$pricing.grandTotal" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const spendMap = new Map<string, { totalSpend: number; totalOrders: number }>();
    spendAgg.forEach((item) => {
      if (item._id) {
        spendMap.set(item._id.toString(), {
          totalSpend: Math.round(item.totalSpend),
          totalOrders: item.totalOrders,
        });
      }
    });

    const rows = customers.map((c) => {
      const stats = spendMap.get(c._id.toString()) || { totalSpend: 0, totalOrders: 0 };
      return {
        "Customer ID": c._id.toString(),
        "Name": c.name,
        "Email": c.email || "",
        "Phone": c.phone,
        "Customer Type": c.customerType || "b2c",
        "Company Name": c.companyName || "",
        "GST Number": c.gstNumber || "",
        "Total Orders": stats.totalOrders,
        "Lifetime Spend (INR)": stats.totalSpend,
        "Registered At": c.createdAt?.toISOString() || "",
      };
    });

    return this.generateBuffer(rows, "Customers", format);
  }

  static async exportProducts(format: "csv" | "xlsx" = "xlsx"): Promise<Buffer> {
    const products = await Product.find().populate("category", "name").sort({ name: 1 });

    const rows = products.map((p: any) => ({
      "SKU": p.SKU,
      "Product Name": p.name,
      "Category": p.category?.name || "",
      "Brand": p.brand,
      "Price (INR)": p.price,
      "Discount Price (INR)": p.discountPrice || "",
      "Stock": p.stock,
      "Low Stock Threshold": p.lowStockThreshold,
      "Unit": p.unit,
      "Capacity": p.capacity || "",
      "Fire Class": Array.isArray(p.fireClass) ? p.fireClass.join(", ") : "",
      "Status": p.isActive ? "Active" : "Inactive",
      "Created At": p.createdAt?.toISOString() || "",
    }));

    return this.generateBuffer(rows, "Products", format);
  }

  static async exportServices(format: "csv" | "xlsx" = "xlsx"): Promise<Buffer> {
    const bookings = await ServiceBooking.find().sort({ createdAt: -1 });

    const rows = bookings.map((b) => ({
      "Booking Number": b.bookingId,
      "Service Type": b.serviceType,
      "Customer Name": b.customerName,
      "Phone": b.phone,
      "Status": b.status,
      "Assigned Technician": b.assignedTechnicianName || "",
      "Preferred Date": b.preferredDate ? new Date(b.preferredDate).toLocaleDateString("en-IN") : "",
      "Preferred Time": b.preferredTime || "",
      "City": b.serviceAddress?.city || "",
      "Total Cost (INR)": b.cost?.total ?? (b.cost?.serviceFee || 0),
      "Payment Status": b.cost?.paymentStatus || "Pending",
      "Created At": b.createdAt?.toISOString() || "",
    }));

    return this.generateBuffer(rows, "Services", format);
  }
}
