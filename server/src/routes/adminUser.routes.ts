import { Router } from "express";
import { adminUserController } from "../controllers/adminUser.controller";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

// Staff users list and details - requires admins.read permission (super_admin, admin)
router.get("/", requireAuth, requirePermission("admins.read"), adminUserController.getAdminUsers);
router.get("/:id", requireAuth, requirePermission("admins.read"), adminUserController.getAdminUserById);

// Staff user modification - requires admins.manage permission (super_admin only)
router.post("/", requireAuth, requirePermission("admins.manage"), adminUserController.createAdminUser);
router.patch("/:id", requireAuth, requirePermission("admins.manage"), adminUserController.updateAdminUser);
router.patch("/:id/status", requireAuth, requirePermission("admins.manage"), adminUserController.updateAdminUser);
router.patch("/:id/role", requireAuth, requirePermission("admins.manage"), adminUserController.updateAdminUser);
router.post("/:id/change-password", requireAuth, requirePermission("admins.manage"), adminUserController.changeAdminPassword);
router.patch("/:id/password", requireAuth, requirePermission("admins.manage"), adminUserController.changeAdminPassword);
router.post("/:id/password", requireAuth, requirePermission("admins.manage"), adminUserController.changeAdminPassword);
router.post("/:id/reset-password", requireAuth, requirePermission("admins.manage"), adminUserController.resetAdminPassword);
router.delete("/:id", requireAuth, requirePermission("admins.manage"), adminUserController.deleteAdminUser);

export default router;
