import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public platform business settings (company info, GST %, shipping threshold)
router.get("/public", settingsController.getPublicSettings);

// Admin-only management
router.get("/", requireAuth, requireRole("super_admin", "admin"), settingsController.getAllSettings);
router.get("/:key", requireAuth, requireRole("super_admin", "admin"), settingsController.getSettingByKey);
router.put("/:key", requireAuth, requireRole("super_admin", "admin"), settingsController.updateSetting);

export default router;
