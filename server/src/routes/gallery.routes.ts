import { Router } from "express";
import { galleryController } from "../controllers/gallery.controller";
import { validateBody } from "../middleware/validate";
import { createGallerySchema, updateGallerySchema } from "../validators/gallery.validators";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public: view gallery
router.get("/", galleryController.getAll);
router.get("/:id", galleryController.getById);

// Staff management
router.get("/admin", requireAuth, requireRole("super_admin", "admin"), galleryController.getAll);
router.get("/admin/:id", requireAuth, requireRole("super_admin", "admin"), galleryController.getById);
router.post("/admin", requireAuth, requireRole("super_admin", "admin"), validateBody(createGallerySchema), galleryController.create);
router.put("/admin/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateGallerySchema), galleryController.update);
router.delete("/admin/:id", requireAuth, requireRole("super_admin", "admin"), galleryController.delete);

router.post("/", requireAuth, requireRole("super_admin", "admin"), validateBody(createGallerySchema), galleryController.create);
router.put("/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateGallerySchema), galleryController.update);
router.delete("/:id", requireAuth, requireRole("super_admin", "admin"), galleryController.delete);

export default router;
