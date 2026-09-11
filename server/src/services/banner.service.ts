import { Banner, IBanner } from "../models/Banner";
import { CreateBannerInput, UpdateBannerInput } from "../validators/banner.validators";
import { ApiError } from "../utils/ApiError";

export class BannerService {
  static async getActiveBanners(position?: string): Promise<IBanner[]> {
    const now = new Date();
    const filter: Record<string, any> = {
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
      ],
    };
    if (position) {
      if (position === "home_middle" || position === "home_secondary") {
        filter.position = { $in: ["home_middle", "home_secondary"] };
      } else {
        filter.position = position;
      }
    }
    return await Banner.find(filter).sort({ sortOrder: 1, createdAt: 1 });
  }

  static async listAllBannersAdmin(): Promise<IBanner[]> {
    return await Banner.find({}).sort({ position: 1, sortOrder: 1 });
  }

  static async getBannerById(id: string): Promise<IBanner> {
    const banner = await Banner.findById(id);
    if (!banner) throw ApiError.notFound("Banner not found");
    return banner;
  }

  static async createBanner(data: CreateBannerInput): Promise<IBanner> {
    const bannerData = { ...data };
    if (bannerData.order !== undefined && bannerData.sortOrder === undefined) {
      bannerData.sortOrder = bannerData.order;
    }
    return await Banner.create(bannerData);
  }

  static async updateBanner(id: string, data: UpdateBannerInput): Promise<IBanner | null> {
    const bannerData = { ...data };
    if (bannerData.order !== undefined && bannerData.sortOrder === undefined) {
      bannerData.sortOrder = bannerData.order;
    }
    return await Banner.findByIdAndUpdate(id, bannerData, { new: true });
  }

  static async deleteBanner(id: string): Promise<boolean> {
    const res = await Banner.findByIdAndDelete(id);
    return Boolean(res);
  }
}
