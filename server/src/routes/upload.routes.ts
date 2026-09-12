import { Router, Request, Response } from "express";
import multer from "multer";
import { uploadService } from "../services/upload.service";
import { requireAuth, requirePermission } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const router = Router();

const storage = multer.memoryStorage();

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest("Invalid file type. Only JPEG, PNG, WEBP, and SVG images are allowed"));
    }
  },
});

const uploadDoc = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest("Invalid document type. Only PDF and image files are allowed"));
    }
  },
});

router.post(
  "/image",
  requireAuth,
  (req: Request, _res: Response, next: import("express").NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    const isStaff =
      req.user.role === "super_admin" ||
      req.user.role === "admin" ||
      req.user.permissions?.includes("products.create") ||
      req.user.permissions?.includes("blog.manage") ||
      req.user.permissions?.includes("settings.manage") ||
      req.user.permissions?.includes("gallery.manage");
    if (!isStaff) {
      return next(ApiError.forbidden("Insufficient permissions to upload images"));
    }
    next();
  },
  uploadImage.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest("No image file uploaded");
    }
    const folder = (req.body?.folder as string) || (req.query?.folder as string) || "products";
    const result = await uploadService.uploadFile(req.file, folder);
    return sendSuccess(res, 200, "Image uploaded successfully", result);
  })
);

router.post(
  "/document",
  requireAuth,
  requirePermission("products.create"),
  uploadDoc.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest("No document file uploaded");
    }
    const result = await uploadService.uploadFile(req.file, "datasheets");
    return sendSuccess(res, 200, "Document uploaded successfully", result);
  })
);

export default router;
