import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { validateBody } from "../middleware/validate";
import { createReviewSchema, updateReviewStatusSchema } from "../validators/review.validators";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public: Get reviews for a specific product
router.get("/product/:productId", reviewController.getProductReviews);
router.get("/recent", reviewController.getRecentApprovedReviews);

// Customer endpoints
router.post("/", requireAuth, validateBody(createReviewSchema), reviewController.createReview);
router.put("/:id", requireAuth, reviewController.updateReview);
router.delete("/:id", requireAuth, reviewController.deleteReview);

// Staff / Admin endpoints
router.get("/", requireAuth, requireRole("super_admin", "admin"), reviewController.listAllReviews);
router.get("/admin", requireAuth, requireRole("super_admin", "admin"), reviewController.listAllReviews);
router.patch("/admin/:id/status", requireAuth, requireRole("super_admin", "admin"), validateBody(updateReviewStatusSchema), reviewController.moderateReview);
router.delete("/admin/:id", requireAuth, requireRole("super_admin", "admin"), reviewController.deleteReview);
router.patch("/:id/status", requireAuth, requireRole("super_admin", "admin"), validateBody(updateReviewStatusSchema), reviewController.moderateReview);

export default router;
