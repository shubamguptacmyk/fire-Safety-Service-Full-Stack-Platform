import { Router } from "express";
import {
  getMyInvoices,
  listInvoices,
  createInvoice,
  getInvoiceById,
  downloadInvoicePdfDirect,
} from "../controllers/invoice.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole("super_admin", "admin", "accountant"), createInvoice);
router.get("/", listInvoices);
router.get("/my-invoices", getMyInvoices);
router.get("/:id", getInvoiceById);
router.get("/:id/pdf", downloadInvoicePdfDirect);

export default router;
