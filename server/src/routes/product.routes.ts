import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { requireAuth, requirePermission } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  productQuerySchema,
} from "../validators/product.validators";

import { reviewController } from "../controllers/review.controller";

const router = Router();

// Public routes
router.get("/", validate(productQuerySchema), productController.getAll);
router.get("/featured-bestsellers", productController.getFeaturedAndBestSellers);
router.get("/filters", productController.getFilterOptions);
router.get("/slug/:slug", productController.getBySlug);
router.get("/:productId/reviews", reviewController.getProductReviews);
router.get("/:id", productController.getById);

// Staff routes
router.get(
  "/admin/low-stock",
  requireAuth,
  requirePermission("products.read"),
  productController.getLowStock
);

router.post(
  "/",
  requireAuth,
  requirePermission("products.create"),
  validate(createProductSchema),
  productController.create
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("products.update"),
  validate(updateProductSchema),
  productController.update
);

router.patch(
  "/:id/stock",
  requireAuth,
  requirePermission("products.update"),
  validate(updateStockSchema),
  productController.updateStock
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("products.delete"),
  productController.delete
);

export default router;
