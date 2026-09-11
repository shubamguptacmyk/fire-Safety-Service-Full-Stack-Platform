import { FilterQuery, Types } from "mongoose";
import { Product, IProduct } from "../models/Product";
import { Category } from "../models/Category";
import { ApiError } from "../utils/ApiError";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  fireClass?: string;
  capacity?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: string;
  isFeatured?: string;
  isBestSeller?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "featured" | "bestseller" | "name_asc";
  includeInactive?: boolean;
}

export const productService = {
  async getProducts(params: ProductQueryFilters) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 12));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IProduct> = {};

    if (!params.includeInactive) {
      filter.isActive = true;
    }

    // Category filter by ID or slug
    if (params.category) {
      if (Types.ObjectId.isValid(params.category)) {
        filter.category = new Types.ObjectId(params.category);
      } else {
        const cat = await Category.findOne({ slug: params.category.toLowerCase() });
        if (cat) {
          filter.category = cat._id;
        } else {
          // If category slug does not exist, return empty result
          return {
            products: [],
            meta: { page, limit, total: 0, totalPages: 0 },
          };
        }
      }
    }

    if (params.subcategory) {
      filter.subcategory = new RegExp(`^${params.subcategory}$`, "i");
    }

    if (params.brand) {
      filter.brand = new RegExp(params.brand, "i");
    }

    if (params.fireClass) {
      const classes = params.fireClass.split(",").map((c) => c.trim());
      filter.fireClass = { $in: classes };
    }

    if (params.capacity) {
      filter.capacity = new RegExp(params.capacity, "i");
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {};
      if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
      if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
    }

    if (params.inStock === "true") {
      filter.stock = { $gt: 0 };
    } else if (params.inStock === "false") {
      filter.stock = 0;
    }

    if (params.isFeatured === "true") {
      filter.isFeatured = true;
    }

    if (params.isBestSeller === "true") {
      filter.isBestSeller = true;
    }

    // Text search or regex fallback
    if (params.search && params.search.trim()) {
      const trimmed = params.search.trim();
      filter.$or = [
        { name: { $regex: trimmed, $options: "i" } },
        { brand: { $regex: trimmed, $options: "i" } },
        { SKU: { $regex: trimmed, $options: "i" } },
        { shortDescription: { $regex: trimmed, $options: "i" } },
      ];
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    switch (params.sort) {
      case "price_asc":
        sortOptions = { price: 1, _id: 1 };
        break;
      case "price_desc":
        sortOptions = { price: -1, _id: 1 };
        break;
      case "name_asc":
        sortOptions = { name: 1, _id: 1 };
        break;
      case "featured":
        sortOptions = { isFeatured: -1, createdAt: -1 };
        break;
      case "bestseller":
        sortOptions = { isBestSeller: -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug: slug.toLowerCase() })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      throw ApiError.notFound(`Product '${slug}' not found`);
    }

    // Fetch related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .select("name slug SKU brand price discountPrice images capacity fireClass stock isFeatured isBestSeller")
      .limit(4)
      .lean();

    return { product, relatedProducts };
  },

  async getProductById(id: string) {
    const product = await Product.findById(id).populate("category", "name slug");
    if (!product) {
      throw ApiError.notFound("Product not found");
    }
    return product;
  },

  async getFeaturedAndBestSellers() {
    const [featured, bestSellers] = await Promise.all([
      Product.find({ isFeatured: true, isActive: true })
        .populate("category", "name slug")
        .limit(8)
        .lean(),
      Product.find({ isBestSeller: true, isActive: true })
        .populate("category", "name slug")
        .limit(8)
        .lean(),
    ]);

    return { featured, bestSellers };
  },

  async getFilterOptions() {
    const [brands, fireClasses, capacities, priceBounds] = await Promise.all([
      Product.distinct("brand", { isActive: true }),
      Product.distinct("fireClass", { isActive: true }),
      Product.distinct("capacity", { isActive: true, capacity: { $ne: null } }),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
    ]);

    const categories = await Category.find({ isActive: true }).select("name slug").lean();

    return {
      categories,
      brands: brands.filter(Boolean).sort(),
      fireClasses: fireClasses.filter(Boolean).sort(),
      capacities: capacities.filter(Boolean).sort(),
      minPrice: priceBounds[0]?.minPrice || 0,
      maxPrice: priceBounds[0]?.maxPrice || 100000,
    };
  },

  async createProduct(data: any) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    const [existingSlug, existingSKU] = await Promise.all([
      Product.findOne({ slug }),
      Product.findOne({ SKU: data.SKU.toUpperCase() }),
    ]);

    if (existingSlug) {
      throw ApiError.conflict(`Product with slug '${slug}' already exists`);
    }

    if (existingSKU) {
      throw ApiError.conflict(`Product with SKU '${data.SKU.toUpperCase()}' already exists`);
    }

    if (!data.category || !Types.ObjectId.isValid(data.category)) {
      throw ApiError.badRequest("Invalid category ID");
    }

    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      throw ApiError.badRequest("Invalid category ID");
    }

    const product = await Product.create({
      ...data,
      slug,
      SKU: data.SKU.toUpperCase(),
    });

    return product.populate("category", "name slug");
  },

  async updateProduct(id: string, data: any) {
    const product = await Product.findById(id);
    if (!product) {
      throw ApiError.notFound("Product not found");
    }

    if (data.slug || (data.name && !data.slug)) {
      const newSlug = slugify(data.slug || data.name);
      const existing = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) {
        throw ApiError.conflict(`Product with slug '${newSlug}' already exists`);
      }
      data.slug = newSlug;
    }

    if (data.SKU) {
      const upperSKU = data.SKU.toUpperCase();
      const existingSKU = await Product.findOne({ SKU: upperSKU, _id: { $ne: id } });
      if (existingSKU) {
        throw ApiError.conflict(`Product with SKU '${upperSKU}' already exists`);
      }
      data.SKU = upperSKU;
    }

    if (data.category !== undefined) {
      if (!data.category || !Types.ObjectId.isValid(data.category)) {
        throw ApiError.badRequest("Invalid category ID");
      }
      const categoryExists = await Category.findById(data.category);
      if (!categoryExists) {
        throw ApiError.badRequest("Invalid category ID");
      }
    }

    Object.assign(product, data);
    await product.save();
    return product.populate("category", "name slug");
  },

  async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw ApiError.notFound("Product not found");
    }
    return product;
  },

  async updateStock(id: string, stock: number) {
    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true, runValidators: true }
    );
    if (!product) {
      throw ApiError.notFound("Product not found");
    }
    return product;
  },

  async getLowStockProducts() {
    return Product.find({
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    })
      .populate("category", "name slug")
      .sort({ stock: 1 })
      .lean();
  },
};
