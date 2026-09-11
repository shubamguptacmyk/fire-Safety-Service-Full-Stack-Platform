import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { GalleryService } from "../services/gallery.service";

export const galleryController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const category = req.query.category as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;

    const result = await GalleryService.getAll({ category, isActive }, page, limit);
    sendSuccess(res, 200, "Gallery items", result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const item = await GalleryService.getById(req.params.id);
    sendSuccess(res, 200, "Gallery item", item);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const item = await GalleryService.create(req.body);
    sendSuccess(res, 201, "Gallery item created successfully", item);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const item = await GalleryService.update(req.params.id, req.body);
    sendSuccess(res, 200, "Gallery item updated successfully", item);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await GalleryService.delete(req.params.id);
    sendSuccess(res, 200, "Gallery item deleted successfully");
  }),
};
