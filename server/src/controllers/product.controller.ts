import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

export const productController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getProducts(req.query as any);
    return sendSuccess(res, 200, "Products retrieved successfully", result.products, result.meta);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getProductBySlug(req.params.slug);
    return sendSuccess(res, 200, "Product retrieved successfully", result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, 200, "Product retrieved successfully", product);
  }),

  getFeaturedAndBestSellers: asyncHandler(async (_req: Request, res: Response) => {
    const result = await productService.getFeaturedAndBestSellers();
    return sendSuccess(res, 200, "Featured & best-selling products retrieved", result);
  }),

  getFilterOptions: asyncHandler(async (_req: Request, res: Response) => {
    const filters = await productService.getFilterOptions();
    return sendSuccess(res, 200, "Filter options retrieved", filters);
  }),

  getLowStock: asyncHandler(async (_req: Request, res: Response) => {
    const products = await productService.getLowStockProducts();
    return sendSuccess(res, 200, "Low-stock products retrieved", products);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, 201, "Product created successfully", product);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, 200, "Product updated successfully", product);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.deleteProduct(req.params.id);
    return sendSuccess(res, 200, "Product deleted successfully", product);
  }),

  updateStock: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateStock(req.params.id, req.body.stock);
    return sendSuccess(res, 200, "Product stock updated successfully", product);
  }),
};
