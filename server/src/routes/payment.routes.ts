import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { validateBody } from "../middleware/validate";
import { createPaymentSchema, verifyPaymentSchema } from "../validators/payment.validators";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/create", validateBody(createPaymentSchema), paymentController.createPayment);
router.post("/verify", validateBody(verifyPaymentSchema), paymentController.verifyPayment);
router.post("/webhook", paymentController.handleWebhook);
router.get("/", requireAuth, requireRole("super_admin", "admin", "accountant", "sales"), paymentController.listPayments);
router.get("/:id", requireAuth, paymentController.getPayment);
router.patch("/:id/status", requireAuth, requireRole("super_admin", "admin", "accountant"), paymentController.updatePaymentStatus);

export default router;
