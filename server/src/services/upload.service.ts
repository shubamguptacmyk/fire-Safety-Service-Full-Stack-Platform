import path from "path";
import fs from "fs";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";

// Ensure local uploads directory exists
const localUploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

export interface UploadResult {
  url: string;
  publicId: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const uploadService = {
  async uploadFile(
    file: Express.Multer.File,
    folder = "products"
  ): Promise<UploadResult> {
    if (!file) {
      throw ApiError.badRequest("No file provided for upload");
    }

    // 1. If Cloudinary is configured, upload to Cloudinary
    if (isCloudinaryConfigured) {
      return new Promise<UploadResult>((resolve, reject) => {
        const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `fire-safety-platform/${folder}`,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error || !result) {
              return reject(
                ApiError.badRequest(
                  `Cloudinary upload failed: ${error?.message || "Unknown error"}`
                )
              );
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    // 2. Free-first Development fallback: save directly to local `uploads/`
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `${folder}_${safeBaseName}_${Date.now()}_${Math.round(Math.random() * 1e4)}${ext}`;
    const targetFilePath = path.join(localUploadsDir, uniqueName);

    await fs.promises.writeFile(targetFilePath, file.buffer);

    return {
      url: `/uploads/${uniqueName}`,
      publicId: uniqueName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  },

  async deleteFile(publicId: string, resourceType: "image" | "raw" = "image"): Promise<void> {
    if (!publicId) return;

    if (isCloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch {
        /* ignore delete errors */
      }
      return;
    }

    // Local file deletion
    try {
      const localFilePath = path.join(localUploadsDir, publicId);
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
      }
    } catch {
      /* ignore delete errors */
    }
  },
};
