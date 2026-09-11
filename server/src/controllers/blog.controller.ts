import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { BlogService } from "../services/blog.service";
import { BlogStatus } from "../models/BlogPost";

export const blogController = {
  getPublishedPosts: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const category = req.query.category as string | undefined;
    const tag = req.query.tag as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await BlogService.getPublishedPosts({ page, limit, category, tag, search });
    sendSuccess(res, 200, "Published blog posts", result);
  }),

  getPostBySlug: asyncHandler(async (req: Request, res: Response) => {
    const post = await BlogService.getPostBySlug(req.params.slug);
    sendSuccess(res, 200, "Blog article", post);
  }),

  listAllPostsAdmin: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = req.query.status as BlogStatus | undefined;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await BlogService.listAllPostsAdmin({ page, limit, status, category, search });
    sendSuccess(res, 200, "Admin blog posts", result);
  }),

  getPostById: asyncHandler(async (req: Request, res: Response) => {
    const post = await BlogService.getPostById(req.params.id);
    sendSuccess(res, 200, "Blog post details", post);
  }),

  createPost: asyncHandler(async (req: Request, res: Response) => {
    const { User } = await import("../models/User");
    const user = await User.findById(req.user!.id);
    const post = await BlogService.createPost(req.body, {
      id: req.user!.id,
      name: user?.name || "AK Fire Safety Team",
      role: req.user!.role,
    });
    sendSuccess(res, 201, "Blog post created successfully", post);
  }),

  updatePost: asyncHandler(async (req: Request, res: Response) => {
    const post = await BlogService.updatePost(req.params.id, req.body);
    sendSuccess(res, 200, "Blog post updated successfully", post);
  }),

  deletePost: asyncHandler(async (req: Request, res: Response) => {
    await BlogService.deletePost(req.params.id);
    sendSuccess(res, 200, "Blog post deleted successfully");
  }),

  publishPost: asyncHandler(async (req: Request, res: Response) => {
    const post = await BlogService.updatePost(req.params.id, { status: "published" });
    sendSuccess(res, 200, "Blog post published successfully", post);
  }),
};
