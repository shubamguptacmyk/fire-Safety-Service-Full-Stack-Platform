import { Banner, IBanner } from "../models/Banner";
import { CreateBannerInput, UpdateBannerInput } from "../validators/banner.validators";
import { ApiError } from "../utils/ApiError";

export class BannerService {
  static async getActiveBanners(position?: string): Promise<IBanner[]> {
    const filter: Record<string, any> = { isActive: true };
    if (position) filter.position = position;
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
    return await Banner.create(data);
  }

  static async updateBanner(id: string, data: UpdateBannerInput): Promise<IBanner | null> {
    return await Banner.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteBanner(id: string): Promise<boolean> {
    const res = await Banner.findByIdAndDelete(id);
    return Boolean(res);
  }
}
