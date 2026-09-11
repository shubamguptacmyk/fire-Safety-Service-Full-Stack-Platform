import { Router } from "express";
import { auditController } from "../controllers/audit.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireRole("super_admin", "admin"), auditController.listLogs);
router.get("/:id", requireAuth, requireRole("super_admin", "admin"), auditController.getLogById);

export default router;
