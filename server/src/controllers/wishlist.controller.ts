import { Request, Response } from "express";
import { wishlistService } from "../services/wishlist.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const wishlist = await wishlistService.getWishlist(userId);
  return ApiResponse.success(res, "Wishlist retrieved", wishlist);
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const productId = req.params.productId || req.body.productId;
  if (!productId) throw ApiError.badRequest("Product ID is required");
  const wishlist = await wishlistService.toggleWishlist(userId, productId);
  return ApiResponse.success(res, "Wishlist updated", wishlist);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const wishlist = await wishlistService.removeItem(userId, req.params.productId);
  return ApiResponse.success(res, "Item removed from wishlist", wishlist);
});

export const clearWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  await wishlistService.clearWishlist(userId);
  return ApiResponse.success(res, "Wishlist cleared");
});
