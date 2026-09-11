import { Request, Response } from "express";
import { cartService } from "../services/cart.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const cart = await cartService.getCart(userId);
  return ApiResponse.success(res, "Cart retrieved", cart);
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const { productId, quantity } = req.body;
  const cart = await cartService.addItem(userId, productId, quantity || 1);
  return ApiResponse.success(res, "Item added to cart", cart);
});

export const updateQuantity = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const { quantity } = req.body;
  const cart = await cartService.updateQuantity(userId, req.params.productId, quantity);
  return ApiResponse.success(res, "Cart updated", cart);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const cart = await cartService.removeItem(userId, req.params.productId);
  return ApiResponse.success(res, "Item removed from cart", cart);
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  await cartService.clearCart(userId);
  return ApiResponse.success(res, "Cart cleared");
});

export const syncCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const { items } = req.body;
  const cart = await cartService.syncCart(userId, items || []);
  return ApiResponse.success(res, "Cart synchronized", cart);
});
