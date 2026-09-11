import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ReviewService } from "../services/review.service";
import { ReviewStatus } from "../models/Review";

export const reviewController = {
  createReview: asyncHandler(async (req: Request, res: Response) => {
    const review = await ReviewService.createReview(req.user!.id, req.body);
    sendSuccess(res, 201, "Review submitted successfully and is pending moderation", review);
  }),

  getProductReviews: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const result = await ReviewService.getProductReviews(req.params.productId, { page, limit });
    sendSuccess(res, 200, "Product reviews retrieved", result);
  }),

  getRecentApprovedReviews: asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 6;
    const result = await ReviewService.listAllReviews({ status: "approved", limit });
    sendSuccess(res, 200, "Recent approved reviews", result.items);
  }),

  listAllReviews: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as ReviewStatus | undefined;
    const productId = req.query.productId as string | undefined;
    const result = await ReviewService.listAllReviews({ page, limit, status, productId });
    sendSuccess(res, 200, "Reviews list retrieved", result);
  }),

  moderateReview: asyncHandler(async (req: Request, res: Response) => {
    const { status, rejectionReason } = req.body;
    const review = await ReviewService.moderateReview(req.params.id, status, req.user!.id, rejectionReason);
    sendSuccess(res, 200, `Review has been ${status}`, review);
  }),

  updateReview: asyncHandler(async (req: Request, res: Response) => {
    const isStaff = req.user?.role !== "customer";
    const review = await ReviewService.updateReview(req.params.id, req.body, req.user?.id, isStaff);
    sendSuccess(res, 200, "Review updated successfully", review);
  }),

  deleteReview: asyncHandler(async (req: Request, res: Response) => {
    const isStaff = req.user?.role !== "customer";
    await ReviewService.deleteReview(req.params.id, req.user?.id, isStaff);
    sendSuccess(res, 200, "Review deleted successfully");
  }),
};
