import { Request, Response } from "express";
import { orderService } from "../services/order.service";
import { Invoice } from "../models/Invoice";
import { generateInvoicePdfBuffer } from "../services/pdf.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const result = await orderService.createOrder(req.body, userId);
  return ApiResponse.created(res, "Order created successfully", result);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const phone = (req as any).user?.phone;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const orders = await orderService.getMyOrders(userId, phone);
  return ApiResponse.success(res, "Orders retrieved", orders);
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isStaff = permissions.includes("orders.read");
  const order = await orderService.getOrderById(req.params.id, userId, isStaff);
  return ApiResponse.success(res, "Order details retrieved", order);
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, paymentStatus, search } = req.query;
  const result = await orderService.listOrders({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    status: status as string,
    paymentStatus: paymentStatus as string,
    search: search as string,
  });
  return ApiResponse.paginated(res, "Orders retrieved", result.orders, result.meta);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const staffUserId = (req as any).user?.id;
  const order = await orderService.updateOrderStatus(req.params.id, req.body, staffUserId);
  return ApiResponse.success(res, `Order status updated to ${order.status}`, order);
});

export const updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const staffUserId = (req as any).user?.id;
  const { paymentStatus, note } = req.body;
  const order = await orderService.updatePaymentStatus(req.params.id, paymentStatus, staffUserId, note);
  return ApiResponse.success(res, `Payment status updated to ${order.paymentStatus}`, order);
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { reason } = req.body;
  const order = await orderService.cancelOrder(req.params.id, userId, reason);
  return ApiResponse.success(res, "Order cancelled successfully", order);
});

export const downloadInvoicePdf = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isStaff = permissions.includes("orders.read");

  const order = await orderService.getOrderById(req.params.id, userId, isStaff);
  const invoice = await Invoice.findOne({ orderId: order._id });
  if (!invoice) throw ApiError.notFound("Invoice not found for this order");

  const pdfBuffer = await generateInvoicePdfBuffer(invoice, order);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  return res.send(pdfBuffer);
});
