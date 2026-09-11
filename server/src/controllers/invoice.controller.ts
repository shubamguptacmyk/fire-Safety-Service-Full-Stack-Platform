import { Request, Response } from "express";
import { Invoice } from "../models/Invoice";
import { Order } from "../models/Order";
import { generateInvoicePdfBuffer } from "../services/pdf.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

export const getMyInvoices = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const phone = (req as any).user?.phone;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  const query: any = {
    $or: [{ user: userId }],
  };
  if (phone) {
    query.$or.push({ "customer.phone": phone });
  }

  const invoices = await Invoice.find(query).sort({ createdAt: -1 });
  return ApiResponse.success(res, "Invoices retrieved", invoices);
});

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isStaff = permissions.includes("orders.read");

  if (!isStaff) {
    const phone = (req as any).user?.phone;
    const query: any = { $or: [{ user: userId }] };
    if (phone) query.$or.push({ "customer.phone": phone });
    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    return ApiResponse.success(res, "Invoices retrieved", invoices);
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.search) {
    filter.$or = [
      { invoiceNumber: { $regex: req.query.search as string, $options: "i" } },
      { "customer.name": { $regex: req.query.search as string, $options: "i" } },
      { "customer.phone": { $regex: req.query.search as string, $options: "i" } },
    ];
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Invoice.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, "Invoices retrieved", invoices, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const invoice = await Invoice.create({
    ...req.body,
    invoiceNumber: req.body.invoiceNumber || invoiceNumber,
    invoiceDate: req.body.invoiceDate || new Date(),
  });
  return ApiResponse.created(res, "Invoice created successfully", invoice);
});

export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isStaff = permissions.includes("orders.read");

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound("Invoice not found");

  if (!isStaff && userId && invoice.user && invoice.user.toString() !== userId) {
    throw ApiError.forbidden("You do not have permission to view this invoice");
  }

  return ApiResponse.success(res, "Invoice details retrieved", invoice);
});

export const downloadInvoicePdfDirect = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isStaff = permissions.includes("orders.read");

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound("Invoice not found");

  if (!isStaff && userId && invoice.user && invoice.user.toString() !== userId) {
    throw ApiError.forbidden("Access denied");
  }

  const order = await Order.findById(invoice.orderId);
  const pdfBuffer = await generateInvoicePdfBuffer(invoice, order || undefined);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  return res.send(pdfBuffer);
});
