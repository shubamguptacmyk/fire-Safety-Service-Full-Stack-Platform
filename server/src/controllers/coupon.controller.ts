import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { CouponService } from "../services/coupon.service";

export const couponController = {
  validateCoupon: asyncHandler(async (req: Request, res: Response) => {
    const result = await CouponService.validateCoupon(req.body, req.user?.id);
    sendSuccess(res, 200, "Coupon is valid", result);
  }),

  listCoupons: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const result = await CouponService.listCoupons({ page, limit, isActive });
    sendSuccess(res, 200, "Coupons retrieved", result);
  }),

  getCouponById: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await CouponService.getCouponById(req.params.id);
    sendSuccess(res, 200, "Coupon retrieved", coupon);
  }),

  createCoupon: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await CouponService.createCoupon(req.body);
    sendSuccess(res, 201, "Coupon created successfully", coupon);
  }),

  updateCoupon: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await CouponService.updateCoupon(req.params.id, req.body);
    sendSuccess(res, 200, "Coupon updated successfully", coupon);
  }),

  deleteCoupon: asyncHandler(async (req: Request, res: Response) => {
    await CouponService.deleteCoupon(req.params.id);
    sendSuccess(res, 200, "Coupon deleted successfully");
  }),
};
