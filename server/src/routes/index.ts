import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import uploadRoutes from "./upload.routes";
import orderRoutes from "./order.routes";
import quoteRoutes from "./quote.routes";
import cartRoutes from "./cart.routes";
import wishlistRoutes from "./wishlist.routes";
import invoiceRoutes from "./invoice.routes";
import equipmentRoutes from "./equipment.routes";
import technicianRoutes from "./technician.routes";
import amcRoutes from "./amc.routes";
import serviceRoutes from "./service.routes";
import notificationRoutes from "./notification.routes";
import paymentRoutes from "./payment.routes";
import couponRoutes from "./coupon.routes";
import reviewRoutes from "./review.routes";
import blogRoutes from "./blog.routes";
import faqRoutes from "./faq.routes";
import bannerRoutes from "./banner.routes";
import galleryRoutes from "./gallery.routes";
import settingsRoutes from "./settings.routes";
import dashboardRoutes from "./dashboard.routes";
import reportRoutes from "./report.routes";
import crmRoutes from "./crm.routes";
import auditRoutes from "./audit.routes";
import adminUserRoutes from "./adminUser.routes";

const router = Router();

// Core APIs
router.use("/auth", authRoutes);
router.use("/admins", adminUserRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/upload", uploadRoutes);
router.use("/orders", orderRoutes);
router.use("/quotes", quoteRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/technicians", technicianRoutes);
router.use("/amc", amcRoutes);
router.use("/services", serviceRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/coupons", couponRoutes);
router.use("/reviews", reviewRoutes);
router.use("/blog", blogRoutes);
router.use("/faqs", faqRoutes);
router.use("/banners", bannerRoutes);
router.use("/gallery", galleryRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/crm", crmRoutes);
router.use("/audit-logs", auditRoutes);

import { getAdminNotifications, deleteNotification } from "../controllers/notification.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const adminNotificationRouter = Router();
adminNotificationRouter.use(requireAuth, requireRole("super_admin", "admin"));
adminNotificationRouter.get("/", getAdminNotifications);
adminNotificationRouter.delete("/:id", deleteNotification);

// Admin-specific route aliases for clean dashboard routing
router.use("/admin/orders", orderRoutes);
router.use("/admin/quotes", quoteRoutes);
router.use("/admin/invoices", invoiceRoutes);
router.use("/admin/payments", paymentRoutes);
router.use("/admin/coupons", couponRoutes);
router.use("/admin/reviews", reviewRoutes);
router.use("/admin/blog", blogRoutes);
router.use("/admin/amc", amcRoutes);
router.use("/admin/services", serviceRoutes);
router.use("/admin/technicians", technicianRoutes);
router.use("/admin/equipment", equipmentRoutes);
router.use("/admin/faqs", faqRoutes);
router.use("/admin/banners", bannerRoutes);
router.use("/admin/gallery", galleryRoutes);
router.use("/admin/notifications", adminNotificationRouter);
router.use("/admin/dashboard", dashboardRoutes);
router.use("/admin/reports", reportRoutes);
router.use("/admin/crm", crmRoutes);
router.use("/admin/audit-logs", auditRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/admin/admins", adminUserRoutes);

// Comprehensive Health & Readiness probe
router.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? "connected"
      : dbState === 2
      ? "connecting"
      : dbState === 3
      ? "disconnecting"
      : "disconnected";

  res.json({
    success: true,
    status: dbState === 1 ? "ok" : "degraded",
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: "2.0.0",
  });
});

export default router;
