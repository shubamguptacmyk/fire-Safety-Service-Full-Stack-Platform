import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { FAQService } from "../services/faq.service";

export const faqController = {
  getPublicFAQs: asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const faqs = await FAQService.getPublicFAQs(category);
    sendSuccess(res, 200, "Frequently asked questions", faqs);
  }),

  listAllFAQsAdmin: asyncHandler(async (_req: Request, res: Response) => {
    const faqs = await FAQService.listAllFAQsAdmin();
    sendSuccess(res, 200, "All FAQs", faqs);
  }),

  getFAQById: asyncHandler(async (req: Request, res: Response) => {
    const faq = await FAQService.getFAQById(req.params.id);
    sendSuccess(res, 200, "FAQ details", faq);
  }),

  createFAQ: asyncHandler(async (req: Request, res: Response) => {
    const faq = await FAQService.createFAQ(req.body);
    sendSuccess(res, 201, "FAQ created successfully", faq);
  }),

  updateFAQ: asyncHandler(async (req: Request, res: Response) => {
    const faq = await FAQService.updateFAQ(req.params.id, req.body);
    sendSuccess(res, 200, "FAQ updated successfully", faq);
  }),

  updateFAQStatus: asyncHandler(async (req: Request, res: Response) => {
    const { isActive } = req.body;
    const faq = await FAQService.updateFAQ(req.params.id, { isActive });
    sendSuccess(res, 200, "FAQ status updated successfully", faq);
  }),

  deleteFAQ: asyncHandler(async (req: Request, res: Response) => {
    await FAQService.deleteFAQ(req.params.id);
    sendSuccess(res, 200, "FAQ deleted successfully");
  }),
};
