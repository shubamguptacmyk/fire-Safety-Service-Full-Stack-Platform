import { Review, IReview, ReviewStatus } from "../models/Review";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { CreateReviewInput } from "../validators/review.validators";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

export class ReviewService {
  /**
   * Submit a review for a product or service
   */
  static async createReview(userId: string | Types.ObjectId, data: CreateReviewInput): Promise<IReview> {
    const user = await User.findById(userId);
    if (!user) throw ApiError.unauthorized("User not found");

    let isVerifiedPurchase = false;
    if (data.productId) {
      const order = await Order.findOne({
        user: new Types.ObjectId(userId.toString()),
        "items.product": new Types.ObjectId(data.productId),
        status: "Delivered",
      });
      if (order) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      product: data.productId ? new Types.ObjectId(data.productId) : undefined,
      serviceType: data.serviceType,
      userId: new Types.ObjectId(userId.toString()),
      userName: user.name,
      userEmail: user.email,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      isVerifiedPurchase,
      status: "pending",
    });

    return review;
  }

  /**
   * Get approved reviews for a specific product
   */
  static async getProductReviews(productId: string, query: { page?: number; limit?: number } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const skip = (page - 1) * limit;

    const filter = {
      product: new Types.ObjectId(productId),
      status: "approved",
    };

    const [reviews, total, breakdown] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { product: new Types.ObjectId(productId), status: "approved" } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;
    for (const b of breakdown) {
      ratingDistribution[b._id] = b.count;
      totalScore += b._id * b.count;
    }

    const averageRating = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 5.0;

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      averageRating,
      ratingDistribution,
    };
  }

  /**
   * Admin: query reviews across all products/services
   */
  static async listAllReviews(query: {
    status?: ReviewStatus;
    productId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;
    if (query.productId) filter.product = new Types.ObjectId(query.productId);

    const [items, total] = await Promise.all([
      Review.find(filter).populate("product", "name SKU images").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Admin: Moderate review
   */
  static async moderateReview(
    id: string,
    status: ReviewStatus,
    adminId: string | Types.ObjectId,
    rejectionReason?: string
  ): Promise<IReview> {
    const review = await Review.findById(id);
    if (!review) throw ApiError.notFound("Review not found");

    review.status = status;
    review.moderatedBy = new Types.ObjectId(adminId.toString());
    review.moderatedAt = new Date();
    if (rejectionReason) review.rejectionReason = rejectionReason;

    await review.save();
    return review;
  }

  static async updateReview(
    id: string,
    data: Partial<CreateReviewInput>,
    userId?: string,
    isStaff = false
  ): Promise<IReview> {
    const filter: Record<string, any> = { _id: id };
    if (!isStaff && userId) filter.userId = new Types.ObjectId(userId);

    const review = await Review.findOne(filter);
    if (!review) throw ApiError.notFound("Review not found or not editable");

    if (data.rating) review.rating = data.rating;
    if (data.title) review.title = data.title;
    if (data.comment) review.comment = data.comment;
    if (data.images) review.images = data.images;
    if (!isStaff) review.status = "pending";

    await review.save();
    return review;
  }

  /**
   * Delete review
   */
  static async deleteReview(id: string, userId?: string, isStaff = false): Promise<boolean> {
    const filter: Record<string, any> = { _id: id };
    if (!isStaff && userId) filter.userId = new Types.ObjectId(userId);

    const res = await Review.findOneAndDelete(filter);
    return Boolean(res);
  }
}
