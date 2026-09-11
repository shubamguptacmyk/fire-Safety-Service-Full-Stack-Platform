import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

export const categoryController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";
    const categories = await categoryService.getAllCategories(includeInactive);
    return sendSuccess(res, 200, "Categories retrieved successfully", categories);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    return sendSuccess(res, 200, "Category retrieved successfully", category);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryById(req.params.id);
    return sendSuccess(res, 200, "Category retrieved successfully", category);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    return sendSuccess(res, 201, "Category created successfully", category);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, 200, "Category updated successfully", category);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.deleteCategory(req.params.id);
    return sendSuccess(res, 200, "Category deleted successfully", category);
  }),
};
