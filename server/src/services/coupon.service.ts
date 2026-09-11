import { Coupon, ICoupon } from "../models/Coupon";
import { CreateCouponInput, UpdateCouponInput, ValidateCouponInput } from "../validators/coupon.validators";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

export class CouponService {
  /**
   * Validate a coupon code and calculate applicable discount
   */
  static async validateCoupon(input: ValidateCouponInput, userId?: string | Types.ObjectId) {
    const code = input.code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      throw ApiError.badRequest("Invalid or inactive coupon code");
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      throw ApiError.badRequest("Coupon is not yet active");
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      throw ApiError.badRequest("Coupon has expired");
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw ApiError.badRequest("Coupon usage limit has been reached");
    }

    if (userId) {
      const userUsageCount = coupon.usedBy.filter(
        (u) => u.userId.toString() === userId.toString()
      ).length;
      if (userUsageCount >= coupon.perUserLimit) {
        throw ApiError.badRequest(`You have already redeemed this coupon ${coupon.perUserLimit} time(s)`);
      }
    }

    if (coupon.minimumOrderValue && input.orderAmount < coupon.minimumOrderValue) {
      throw ApiError.badRequest(
        `Minimum order value for this coupon is ₹${coupon.minimumOrderValue.toLocaleString("en-IN")}`
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (input.orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, input.orderAmount);
    discountAmount = Math.round(discountAmount * 100) / 100;

    const finalAmount = Math.max(0, input.orderAmount - discountAmount);

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount,
      couponId: coupon._id,
    };
  }

  /**
   * Record coupon redemption after order placement
   */
  static async recordUsage(
    couponId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    orderId: string | Types.ObjectId,
    discountApplied: number
  ) {
    return await Coupon.findByIdAndUpdate(
      couponId,
      {
        $inc: { usageCount: 1 },
        $push: {
          usedBy: {
            userId: new Types.ObjectId(userId.toString()),
            orderId: new Types.ObjectId(orderId.toString()),
            usedAt: new Date(),
            discountApplied,
          },
        },
      },
      { new: true }
    );
  }

  /**
   * Admin: List coupons
   */
  static async listCoupons(query: { page?: number; limit?: number; isActive?: boolean } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const [items, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async getCouponById(id: string) {
    const coupon = await Coupon.findById(id);
    if (!coupon) throw ApiError.notFound("Coupon not found");
    return coupon;
  }

  static async createCoupon(data: CreateCouponInput): Promise<ICoupon> {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw ApiError.badRequest("Coupon code already exists");

    return await Coupon.create({
      ...data,
      code: data.code.toUpperCase(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  static async updateCoupon(id: string, data: UpdateCouponInput): Promise<ICoupon | null> {
    const payload: any = { ...data };
    if (data.code) payload.code = data.code.toUpperCase();
    if (data.startDate) payload.startDate = new Date(data.startDate);
    if (data.endDate) payload.endDate = new Date(data.endDate);

    return await Coupon.findByIdAndUpdate(id, payload, { new: true });
  }

  static async deleteCoupon(id: string): Promise<boolean> {
    const res = await Coupon.findByIdAndDelete(id);
    return Boolean(res);
  }
}
