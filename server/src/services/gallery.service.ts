import { Gallery, IGalleryItem } from "../models/Gallery";
import { ApiError } from "../utils/ApiError";
import { CreateGalleryInput, UpdateGalleryInput } from "../validators/gallery.validators";

export class GalleryService {
  static async getAll(filter: { category?: string; isActive?: boolean } = {}, page = 1, limit = 50) {
    const query: any = {};
    if (filter.category) query.category = filter.category;
    if (typeof filter.isActive === "boolean") query.isActive = filter.isActive;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      Gallery.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  static async getById(id: string): Promise<IGalleryItem> {
    const item = await Gallery.findById(id);
    if (!item) {
      throw ApiError.notFound("Gallery item not found");
    }
    return item;
  }

  static async create(input: CreateGalleryInput): Promise<IGalleryItem> {
    return Gallery.create(input);
  }

  static async update(id: string, input: UpdateGalleryInput): Promise<IGalleryItem> {
    const item = await Gallery.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!item) {
      throw ApiError.notFound("Gallery item not found");
    }
    return item;
  }

  static async delete(id: string): Promise<void> {
    const item = await Gallery.findByIdAndDelete(id);
    if (!item) {
      throw ApiError.notFound("Gallery item not found");
    }
  }
}
