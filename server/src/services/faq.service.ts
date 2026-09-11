import { FAQ, IFAQ } from "../models/FAQ";
import { CreateFAQInput, UpdateFAQInput } from "../validators/faq.validators";
import { ApiError } from "../utils/ApiError";

export class FAQService {
  /**
   * Get public active FAQs optionally filtered by category
   */
  static async getPublicFAQs(category?: string): Promise<IFAQ[]> {
    const filter: Record<string, any> = { isActive: true };
    if (category) filter.category = category;
    return await FAQ.find(filter).sort({ sortOrder: 1, createdAt: 1 });
  }

  /**
   * Admin: List all FAQs
   */
  static async listAllFAQsAdmin(): Promise<IFAQ[]> {
    return await FAQ.find({}).sort({ category: 1, sortOrder: 1 });
  }

  static async getFAQById(id: string): Promise<IFAQ> {
    const faq = await FAQ.findById(id);
    if (!faq) throw ApiError.notFound("FAQ not found");
    return faq;
  }

  static async createFAQ(data: CreateFAQInput): Promise<IFAQ> {
    return await FAQ.create(data);
  }

  static async updateFAQ(id: string, data: UpdateFAQInput): Promise<IFAQ | null> {
    return await FAQ.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteFAQ(id: string): Promise<boolean> {
    const res = await FAQ.findByIdAndDelete(id);
    return Boolean(res);
  }
}
