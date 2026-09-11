import { Router } from "express";
import { blogController } from "../controllers/blog.controller";
import { validateBody } from "../middleware/validate";
import { createBlogPostSchema, updateBlogPostSchema } from "../validators/blog.validators";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public readers
router.get("/", blogController.getPublishedPosts);
router.get("/slug/:slug", blogController.getPostBySlug);

// Admin endpoints
router.get("/admin", requireAuth, requireRole("super_admin", "admin"), blogController.listAllPostsAdmin);
router.get("/admin/all", requireAuth, requireRole("super_admin", "admin"), blogController.listAllPostsAdmin);
router.get("/admin/:id", requireAuth, requireRole("super_admin", "admin"), blogController.getPostById);
router.post("/admin", requireAuth, requireRole("super_admin", "admin"), validateBody(createBlogPostSchema), blogController.createPost);
router.put("/admin/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateBlogPostSchema), blogController.updatePost);
router.delete("/admin/:id", requireAuth, requireRole("super_admin", "admin"), blogController.deletePost);
router.patch("/admin/:id/publish", requireAuth, requireRole("super_admin", "admin"), blogController.publishPost);

// Standard staff management endpoints
router.get("/post/:id", requireAuth, requireRole("super_admin", "admin"), blogController.getPostById);
router.get("/:slug", blogController.getPostBySlug);
router.post("/", requireAuth, requireRole("super_admin", "admin"), validateBody(createBlogPostSchema), blogController.createPost);
router.put("/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateBlogPostSchema), blogController.updatePost);
router.delete("/:id", requireAuth, requireRole("super_admin", "admin"), blogController.deletePost);
router.patch("/:id/publish", requireAuth, requireRole("super_admin", "admin"), blogController.publishPost);

export default router;
