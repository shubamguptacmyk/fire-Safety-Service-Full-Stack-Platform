import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { BannerService } from "../services/banner.service";

export const bannerController = {
  getActiveBanners: asyncHandler(async (req: Request, res: Response) => {
    const position = req.query.position as string | undefined;
    const banners = await BannerService.getActiveBanners(position);
    sendSuccess(res, 200, "Active banners", banners);
  }),

  listAllBannersAdmin: asyncHandler(async (_req: Request, res: Response) => {
    const banners = await BannerService.listAllBannersAdmin();
    sendSuccess(res, 200, "All banners", banners);
  }),

  getBannerById: asyncHandler(async (req: Request, res: Response) => {
    const banner = await BannerService.getBannerById(req.params.id);
    sendSuccess(res, 200, "Banner details", banner);
  }),

  createBanner: asyncHandler(async (req: Request, res: Response) => {
    const banner = await BannerService.createBanner(req.body);
    sendSuccess(res, 201, "Banner created successfully", banner);
  }),

  updateBanner: asyncHandler(async (req: Request, res: Response) => {
    const banner = await BannerService.updateBanner(req.params.id, req.body);
    sendSuccess(res, 200, "Banner updated successfully", banner);
  }),

  deleteBanner: asyncHandler(async (req: Request, res: Response) => {
    await BannerService.deleteBanner(req.params.id);
    sendSuccess(res, 200, "Banner deleted successfully");
  }),
};
