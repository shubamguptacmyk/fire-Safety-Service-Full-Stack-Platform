import { Router } from "express";
import {
  createEquipment,
  getMyEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  listAllEquipmentAdmin,
  getEquipmentByQR,
} from "../controllers/equipment.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createEquipmentSchema, updateEquipmentSchema } from "../validators/equipment.validators";

const router = Router();

// Customer & Staff endpoints
router.post("/", requireAuth, validateBody(createEquipmentSchema), createEquipment);
router.get("/", requireAuth, (req, res, next) => {
  const perms = (req as any).user?.permissions || [];
  if (perms.includes("equipment.read")) return listAllEquipmentAdmin(req, res, next);
  return getMyEquipment(req, res, next);
});
router.get("/my", requireAuth, getMyEquipment);
router.get("/all", requireAuth, requirePermission("equipment.read"), listAllEquipmentAdmin);
router.get("/qr/:qrCode", requireAuth, getEquipmentByQR);
router.get("/:id", requireAuth, getEquipmentById);
router.put("/:id", requireAuth, validateBody(updateEquipmentSchema), updateEquipment);
router.delete("/:id", requireAuth, deleteEquipment);

export default router;
