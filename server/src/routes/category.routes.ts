import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validators";

const router = Router();

// Public routes
router.get("/", categoryController.getAll);
router.get("/slug/:slug", categoryController.getBySlug);
router.get("/:id", categoryController.getById);

// Staff routes (requires categories.manage permission)
router.post(
  "/",
  requireAuth,
  requirePermission("categories.manage"),
  validate(createCategorySchema),
  categoryController.create
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("categories.manage"),
  validate(updateCategorySchema),
  categoryController.update
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("categories.manage"),
  categoryController.delete
);

export default router;
