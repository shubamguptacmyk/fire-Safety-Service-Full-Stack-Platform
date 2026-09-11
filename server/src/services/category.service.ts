import { Category, ICategory, ISubcategory } from "../models/Category";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const categoryService = {
  async getAllCategories(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return Category.find(filter).sort({ sortOrder: 1, name: 1 });
  },

  async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug: slug.toLowerCase() });
    if (!category) {
      throw ApiError.notFound(`Category with slug '${slug}' not found`);
    }
    return category;
  },

  async getCategoryById(id: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound("Category not found");
    }
    return category;
  },

  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    subcategories?: ISubcategory[];
    isActive?: boolean;
    sortOrder?: number;
  }) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw ApiError.conflict(`Category with slug '${slug}' already exists`);
    }

    return Category.create({
      ...data,
      slug,
      subcategories: data.subcategories || [],
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    });
  },

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug?: string;
      description?: string;
      image?: string;
      subcategories?: ISubcategory[];
      isActive?: boolean;
      sortOrder?: number;
    }>
  ) {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound("Category not found");
    }

    if (data.slug || (data.name && !category.slug)) {
      const newSlug = slugify(data.slug || data.name!);
      const existing = await Category.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict(`Category with slug '${newSlug}' already exists`);
      }
      data.slug = newSlug;
    }

    Object.assign(category, data);
    return category.save();
  },

  async deleteCategory(id: string) {
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete category. There are ${productCount} product(s) linked to this category.`
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw ApiError.notFound("Category not found");
    }
    return category;
  },
};
