import { BlogPost, IBlogPost, BlogStatus } from "../models/BlogPost";
import { CreateBlogPostInput, UpdateBlogPostInput } from "../validators/blog.validators";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class BlogService {
  /**
   * Get published blog posts for public readers
   */
  static async getPublishedPosts(query: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { status: "published" };
    if (query.category) filter.category = query.category;
    if (query.tag) filter.tags = query.tag;
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      BlogPost.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Get single blog post by slug and increment view counter
   */
  static async getPostBySlug(slug: string): Promise<IBlogPost> {
    const post = await BlogPost.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!post) throw ApiError.notFound("Blog article not found");
    return post;
  }

  /**
   * Admin: List all posts (drafts + published + archived)
   */
  static async listAllPostsAdmin(query: {
    page?: number;
    limit?: number;
    status?: BlogStatus;
    category?: string;
    search?: string;
  } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.search) {
      filter.$or = [
        { title: new RegExp(query.search, "i") },
        { excerpt: new RegExp(query.search, "i") },
        { tags: new RegExp(query.search, "i") },
      ];
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      BlogPost.countDocuments(filter),
    ]);

    return { items, posts: items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async getPostById(id: string): Promise<IBlogPost> {
    const post = await BlogPost.findById(id);
    if (!post) throw ApiError.notFound("Blog article not found");
    return post;
  }

  static async createPost(
    data: CreateBlogPostInput,
    author: { id: string | Types.ObjectId; name: string; role?: string }
  ): Promise<IBlogPost> {
    const slug = data.slug ? slugify(data.slug) : slugify(data.title);
    const existing = await BlogPost.findOne({ slug });
    if (existing) throw ApiError.badRequest("A blog post with this slug already exists");

    const featImg =
      data.featuredImage ||
      (data as any).image ||
      (data as any).coverImage ||
      "";
    const sTitle = data.seoTitle || (data as any).seo?.metaTitle;
    const sDesc = data.seoDescription || (data as any).seo?.metaDescription;

    return await BlogPost.create({
      ...data,
      featuredImage: featImg,
      seoTitle: sTitle,
      seoDescription: sDesc,
      slug,
      author: {
        id: new Types.ObjectId(author.id.toString()),
        name: author.name,
        role: author.role,
      },
      publishedAt: data.status === "published" ? new Date() : undefined,
    });
  }

  static async updatePost(id: string, data: UpdateBlogPostInput): Promise<IBlogPost | null> {
    const payload: any = { ...data };
    if (data.slug) {
      payload.slug = slugify(data.slug);
      const existing = await BlogPost.findOne({ slug: payload.slug, _id: { $ne: id } });
      if (existing) {
        throw ApiError.badRequest("A blog post with this slug already exists");
      }
    } else {
      delete payload.slug;
    }
    if ((data as any).image && !payload.featuredImage) {
      payload.featuredImage = (data as any).image;
    }
    if ((data as any).coverImage && !payload.featuredImage) {
      payload.featuredImage = (data as any).coverImage;
    }
    if ((data as any).seo) {
      if ((data as any).seo.metaTitle && !payload.seoTitle) {
        payload.seoTitle = (data as any).seo.metaTitle;
      }
      if ((data as any).seo.metaDescription && !payload.seoDescription) {
        payload.seoDescription = (data as any).seo.metaDescription;
      }
    }
    if (data.status === "published") {
      payload.publishedAt = new Date();
    }

    return await BlogPost.findByIdAndUpdate(id, payload, { new: true });
  }

  static async deletePost(id: string): Promise<boolean> {
    const res = await BlogPost.findByIdAndDelete(id);
    return Boolean(res);
  }
}
