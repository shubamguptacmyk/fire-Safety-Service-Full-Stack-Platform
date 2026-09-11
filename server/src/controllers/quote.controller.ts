import { Request, Response } from "express";
import { quoteService } from "../services/quote.service";
import { generateQuotePdfBuffer } from "../services/pdf.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const createQuote = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const quote = await quoteService.createQuote(req.body, userId);
  return ApiResponse.created(res, "Quotation request submitted successfully", quote);
});

export const getMyQuotes = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const email = (req as any).user?.email;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const quotes = await quoteService.getMyQuotes(userId, email);
  return ApiResponse.success(res, "Quotes retrieved", quotes);
});

export const getQuoteById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isStaff = permissions.includes("quotes.read");
  const quote = await quoteService.getQuoteById(req.params.id, userId, isStaff);
  return ApiResponse.success(res, "Quote details retrieved", quote);
});

export const listQuotes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, search } = req.query;
  const result = await quoteService.listQuotes({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    status: status as string,
    search: search as string,
  });
  return ApiResponse.paginated(res, "Quotes retrieved", result.quotes, result.meta);
});

export const updateQuote = asyncHandler(async (req: Request, res: Response) => {
  const staffUserId = (req as any).user?.id;
  const quote = await quoteService.updateQuote(req.params.id, req.body, staffUserId);
  return ApiResponse.success(res, `Quote updated to ${quote.status}`, quote);
});

export const convertQuoteToOrder = asyncHandler(async (req: Request, res: Response) => {
  const staffUserId = (req as any).user?.id;
  const result = await quoteService.convertQuoteToOrder(req.params.id, staffUserId);
  return ApiResponse.success(res, "Quote converted to order successfully", result);
});

export const downloadQuotePdf = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isStaff = permissions.includes("quotes.read");

  const quote = await quoteService.getQuoteById(req.params.id, userId, isStaff);
  const pdfBuffer = await generateQuotePdfBuffer(quote);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${quote.quoteNumber}.pdf"`);
  return res.send(pdfBuffer);
});

export const cancelQuote = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const quote = await quoteService.cancelQuote(req.params.id, userId, req.body?.reason);
  return ApiResponse.success(res, "Quote request cancelled successfully", quote);
});
