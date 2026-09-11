import { Router } from "express";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getAdminNotifications,
  triggerReminderScanManual,
} from "../controllers/notification.controller";
import { requireAuth, requirePermission, requireRole } from "../middleware/auth";

const router = Router();

router.get("/admin", requireAuth, requireRole("super_admin", "admin"), getAdminNotifications);
router.get("/", requireAuth, getMyNotifications);
router.patch("/read-all", requireAuth, markAllNotificationsRead);
router.patch("/:id/read", requireAuth, markNotificationRead);
router.delete("/:id", requireAuth, deleteNotification);
router.post("/trigger-scan", requireAuth, requirePermission("services.update"), triggerReminderScanManual);

export default router;
