import { Router } from "express";
import {
  listTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  updateTechnicianStatus,
  deleteTechnician,
  getMyJobs,
  updateJobStatus,
  addJobPhotos,
  addJobNotes,
} from "../controllers/technician.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createTechnicianSchema, updateTechnicianSchema } from "../validators/technician.validators";

const router = Router();

// Technician field portal endpoints
router.get("/my-jobs", requireAuth, getMyJobs);
router.patch("/jobs/:id/status", requireAuth, updateJobStatus);
router.post("/jobs/:id/photos", requireAuth, addJobPhotos);
router.post("/jobs/:id/notes", requireAuth, addJobNotes);

// Admin & Staff management endpoints
router.get("/", listTechnicians);
router.get("/admin", requireAuth, requirePermission("services.read"), listTechnicians);
router.get("/admin/:id", requireAuth, requirePermission("services.read"), getTechnicianById);
router.post("/admin", requireAuth, requirePermission("services.update"), validateBody(createTechnicianSchema), createTechnician);
router.put("/admin/:id", requireAuth, requirePermission("services.update"), validateBody(updateTechnicianSchema), updateTechnician);
router.patch("/admin/:id/status", requireAuth, requirePermission("services.update"), updateTechnicianStatus);
router.delete("/admin/:id", requireAuth, requirePermission("services.update"), deleteTechnician);

router.get("/:id", getTechnicianById);
router.post("/", requireAuth, requirePermission("services.update"), validateBody(createTechnicianSchema), createTechnician);
router.put("/:id", requireAuth, requirePermission("services.update"), validateBody(updateTechnicianSchema), updateTechnician);
router.patch("/:id/status", requireAuth, requirePermission("services.update"), updateTechnicianStatus);
router.delete("/:id", requireAuth, requirePermission("services.update"), deleteTechnician);

export default router;
