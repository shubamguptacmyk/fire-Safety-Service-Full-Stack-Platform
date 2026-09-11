import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const dashboardAuth = [requireAuth, requireRole("super_admin", "admin", "sales", "accountant")];

router.get("/", dashboardAuth, dashboardController.getOverview);
router.get("/overview", dashboardAuth, dashboardController.getOverview);
router.get("/summary", dashboardAuth, dashboardController.getSummary);
router.get("/revenue", dashboardAuth, dashboardController.getRevenue);
router.get("/orders", dashboardAuth, dashboardController.getOrders);
router.get("/customers", dashboardAuth, dashboardController.getCustomers);
router.get("/products", dashboardAuth, dashboardController.getProducts);
router.get("/services", dashboardAuth, dashboardController.getServices);
router.get("/amc", dashboardAuth, dashboardController.getAMC);

export default router;
