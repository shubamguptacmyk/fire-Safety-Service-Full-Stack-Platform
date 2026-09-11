import { Router } from "express";
import { bannerController } from "../controllers/banner.controller";
import { validateBody } from "../middleware/validate";
import { createBannerSchema, updateBannerSchema } from "../validators/banner.validators";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public: get active banners
router.get("/", bannerController.getActiveBanners);

// Staff management
router.get("/admin", requireAuth, requireRole("super_admin", "admin"), bannerController.listAllBannersAdmin);
router.get("/admin/all", requireAuth, requireRole("super_admin", "admin"), bannerController.listAllBannersAdmin);
router.get("/admin/:id", requireAuth, requireRole("super_admin", "admin"), bannerController.getBannerById);
router.post("/admin", requireAuth, requireRole("super_admin", "admin"), validateBody(createBannerSchema), bannerController.createBanner);
router.put("/admin/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateBannerSchema), bannerController.updateBanner);
router.delete("/admin/:id", requireAuth, requireRole("super_admin", "admin"), bannerController.deleteBanner);

router.get("/:id", bannerController.getBannerById);
router.post("/", requireAuth, requireRole("super_admin", "admin"), validateBody(createBannerSchema), bannerController.createBanner);
router.put("/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateBannerSchema), bannerController.updateBanner);
router.delete("/:id", requireAuth, requireRole("super_admin", "admin"), bannerController.deleteBanner);

export default router;
