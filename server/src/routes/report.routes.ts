import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const reportRoles = ["super_admin", "admin", "sales", "accountant"];

// Analytical Reports (Section 26)
router.get("/sales", requireAuth, requireRole(...reportRoles), reportController.getSalesReport);
router.get("/revenue", requireAuth, requireRole(...reportRoles), reportController.getRevenueReport);
router.get("/products", requireAuth, requireRole(...reportRoles), reportController.getProductsReport);
router.get("/categories", requireAuth, requireRole(...reportRoles), reportController.getCategoriesReport);
router.get("/customers", requireAuth, requireRole(...reportRoles), reportController.getCustomersReport);
router.get("/amc", requireAuth, requireRole("super_admin", "admin", "sales"), reportController.getAMCReport);
router.get("/services", requireAuth, requireRole("super_admin", "admin", "sales"), reportController.getServicesReport);
router.get("/inventory", requireAuth, requireRole("super_admin", "admin"), reportController.getInventoryReport);

// Data Exports (Section 27 - CSV / XLSX)
router.get("/sales/export", requireAuth, requireRole("super_admin", "admin", "accountant"), reportController.exportSales);
router.get("/customers/export", requireAuth, requireRole("super_admin", "admin"), reportController.exportCustomers);
router.get("/products/export", requireAuth, requireRole("super_admin", "admin"), reportController.exportProducts);
router.get("/services/export", requireAuth, requireRole("super_admin", "admin"), reportController.exportServices);

// Legacy aliases
router.get("/export/orders", requireAuth, requireRole("super_admin", "admin", "accountant"), reportController.exportOrders);
router.get("/export/customers", requireAuth, requireRole("super_admin", "admin"), reportController.exportCustomers);
router.get("/export/products", requireAuth, requireRole("super_admin", "admin"), reportController.exportProducts);
router.get("/export/services", requireAuth, requireRole("super_admin", "admin"), reportController.exportServices);

export default router;
