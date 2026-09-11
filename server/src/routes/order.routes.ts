import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  listOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  downloadInvoicePdf,
} from "../controllers/order.controller";
import { requireAuth, requirePermission, attachUserIfPresent } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from "../validators/order.validators";

const router = Router();

// Create order (guest checkout or authenticated customer)
router.post("/", attachUserIfPresent, validate(createOrderSchema), createOrder);

// Customer order listing
router.get("/", requireAuth, (req, res, next) => {
  const permissions = (req as any).user?.permissions || [];
  if (permissions.includes("orders.read")) {
    return listOrders(req, res, next);
  }
  return getMyOrders(req, res, next);
});
router.get("/my", requireAuth, getMyOrders);
router.get("/my-orders", requireAuth, getMyOrders);

// Admin order listing & details
router.get("/admin", requireAuth, requirePermission("orders.read"), listOrders);
router.get("/admin/:id", requireAuth, requirePermission("orders.read"), getOrderById);

// Single order details (Customer self-service or staff)
router.get("/:id", requireAuth, getOrderById);

// Status and dispatch updates
router.patch(
  "/:id/status",
  requireAuth,
  requirePermission("orders.update"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);
router.patch(
  "/admin/:id/status",
  requireAuth,
  requirePermission("orders.update"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

// Payment status updates
router.patch(
  "/:id/payment-status",
  requireAuth,
  requirePermission("orders.update"),
  updatePaymentStatus
);
router.patch(
  "/admin/:id/payment-status",
  requireAuth,
  requirePermission("orders.update"),
  updatePaymentStatus
);

// Customer self-cancellation for pending orders
router.post("/:id/cancel", requireAuth, validate(cancelOrderSchema), cancelOrder);
router.patch("/:id/cancel", requireAuth, validate(cancelOrderSchema), cancelOrder);

// Download GST Invoice PDF
router.get("/:id/invoice", requireAuth, downloadInvoicePdf);

export default router;
