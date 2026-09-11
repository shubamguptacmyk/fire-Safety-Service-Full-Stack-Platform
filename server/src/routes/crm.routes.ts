import { Router } from "express";
import { crmController } from "../controllers/crm.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/customers", requireAuth, requireRole("super_admin", "admin", "sales"), crmController.getCustomers);
router.get("/customers/:id", requireAuth, requireRole("super_admin", "admin", "sales"), crmController.getCustomer360);
router.patch("/customers/:id/notes", requireAuth, requireRole("super_admin", "admin"), crmController.updateCustomerNotesAndTags);

export default router;
