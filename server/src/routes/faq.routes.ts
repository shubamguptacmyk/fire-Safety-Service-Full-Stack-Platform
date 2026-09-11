import { Router } from "express";
import { faqController } from "../controllers/faq.controller";
import { validateBody } from "../middleware/validate";
import { createFAQSchema, updateFAQSchema } from "../validators/faq.validators";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public FAQs
router.get("/", faqController.getPublicFAQs);

// Staff management
router.get("/admin", requireAuth, requireRole("super_admin", "admin"), faqController.listAllFAQsAdmin);
router.get("/admin/all", requireAuth, requireRole("super_admin", "admin"), faqController.listAllFAQsAdmin);
router.get("/admin/:id", requireAuth, requireRole("super_admin", "admin"), faqController.getFAQById);
router.post("/admin", requireAuth, requireRole("super_admin", "admin"), validateBody(createFAQSchema), faqController.createFAQ);
router.put("/admin/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateFAQSchema), faqController.updateFAQ);
router.patch("/admin/:id/status", requireAuth, requireRole("super_admin", "admin"), faqController.updateFAQStatus);
router.delete("/admin/:id", requireAuth, requireRole("super_admin", "admin"), faqController.deleteFAQ);

router.get("/:id", requireAuth, requireRole("super_admin", "admin"), faqController.getFAQById);
router.post("/", requireAuth, requireRole("super_admin", "admin"), validateBody(createFAQSchema), faqController.createFAQ);
router.put("/:id", requireAuth, requireRole("super_admin", "admin"), validateBody(updateFAQSchema), faqController.updateFAQ);
router.patch("/:id/status", requireAuth, requireRole("super_admin", "admin"), faqController.updateFAQStatus);
router.delete("/:id", requireAuth, requireRole("super_admin", "admin"), faqController.deleteFAQ);

export default router;
