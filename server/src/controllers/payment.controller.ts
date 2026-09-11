import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { PaymentService } from "../services/payment.service";

export const paymentController = {
  createPayment: asyncHandler(async (req: Request, res: Response) => {
    const { orderId, method } = req.body;
    const result = await PaymentService.createPayment(orderId, method, req.user?.id);
    sendSuccess(res, 200, "Payment initialized", result);
  }),

  verifyPayment: asyncHandler(async (req: Request, res: Response) => {
    const { orderId, paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const result = await PaymentService.verifyPayment(orderId, {
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    sendSuccess(res, 200, "Payment verified successfully", result);
  }),

  getPayment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const isStaff = req.user?.role !== "customer";
    const payment = await PaymentService.getPaymentById(id, req.user?.id, isStaff);
    sendSuccess(res, 200, "Payment details", payment);
  }),

  handleWebhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const result = await PaymentService.handleWebhook(req.body, signature, rawBody);
    sendSuccess(res, 200, "Webhook processed", result);
  }),

  listPayments: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as string | undefined;
    const method = req.query.method as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await PaymentService.listPayments({ page, limit, status, method, search });
    sendSuccess(res, 200, "Payments retrieved", result);
  }),

  updatePaymentStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await PaymentService.updatePaymentStatus(id, status);
    sendSuccess(res, 200, "Payment status updated", result);
  }),
};
