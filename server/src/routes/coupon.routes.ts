import { Router } from "express";
import { couponController } from "../controllers/coupon.controller";
import { validateBody } from "../middleware/validate";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "../validators/coupon.validators";
import { requireAuth, requireRole, attachUserIfPresent } from "../middleware/auth";

const router = Router();

// Public / Customer validation
router.post("/validate", attachUserIfPresent, validateBody(validateCouponSchema), couponController.validateCoupon);

// Staff management
router.get("/", requireAuth, requireRole("super_admin", "admin"), couponController.listCoupons);
router.get("/:id", requireAuth, requireRole("super_admin", "admin"), couponController.getCouponById);
router.post("/", requireAuth, requireRole("super_admin", "admin"), validateBody(createCouponSchema), couponController.createCoupon);
router.put("/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateCouponSchema), couponController.updateCoupon);
router.delete("/:id", requireAuth, requireRole("super_admin", "admin"), couponController.deleteCoupon);

export default router;
