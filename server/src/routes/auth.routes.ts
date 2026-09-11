import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../validators/auth.validators";
import { requireAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, validate(refreshSchema), authController.refresh);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.get("/verify-email", authLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post("/resend-verification", authLimiter, validate(resendVerificationSchema), authController.resendVerification);
router.post("/send-verification-email", requireAuth, authController.resendVerificationEmail);
router.post("/logout", authController.logout);
router.post("/logout-all", requireAuth, authController.logoutAll);
router.get("/me", requireAuth, authController.me);

export default router;
