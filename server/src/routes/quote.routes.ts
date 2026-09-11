import { Router } from "express";
import {
  createQuote,
  getMyQuotes,
  getQuoteById,
  listQuotes,
  updateQuote,
  convertQuoteToOrder,
  downloadQuotePdf,
  cancelQuote,
} from "../controllers/quote.controller";
import { requireAuth, requirePermission, attachUserIfPresent } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createQuoteSchema,
  updateQuoteStatusSchema,
} from "../validators/quote.validators";

const router = Router();

// Submit quotation request (guest or logged-in)
router.post("/", attachUserIfPresent, validate(createQuoteSchema), createQuote);

// Customer view their quotes or staff list quotes
router.get("/", requireAuth, (req, res, next) => {
  const permissions = (req as any).user?.permissions || [];
  if (permissions.includes("quotes.read")) {
    return listQuotes(req, res, next);
  }
  return getMyQuotes(req, res, next);
});
router.get("/my-quotes", requireAuth, getMyQuotes);

// Admin quotes listing & details
router.get("/admin", requireAuth, requirePermission("quotes.read"), listQuotes);
router.get("/admin/:id", requireAuth, requirePermission("quotes.read"), getQuoteById);

// Single quote details
router.get("/:id", requireAuth, getQuoteById);

// Customer cancel quotation
router.patch("/:id/cancel", requireAuth, cancelQuote);
router.post("/:id/cancel", requireAuth, cancelQuote);

// Admin update quote status & proposal pricing
router.put(
  "/:id",
  requireAuth,
  requirePermission("quotes.update"),
  validate(updateQuoteStatusSchema),
  updateQuote
);
router.patch(
  "/:id/status",
  requireAuth,
  requirePermission("quotes.update"),
  validate(updateQuoteStatusSchema),
  updateQuote
);
router.patch(
  "/admin/:id/status",
  requireAuth,
  requirePermission("quotes.update"),
  validate(updateQuoteStatusSchema),
  updateQuote
);

// Admin convert quote to order
router.post(
  "/:id/convert",
  requireAuth,
  requirePermission("quotes.update"),
  convertQuoteToOrder
);
router.post(
  "/admin/:id/convert-to-order",
  requireAuth,
  requirePermission("quotes.update"),
  convertQuoteToOrder
);

// Download Quotation PDF
router.get("/:id/pdf", requireAuth, downloadQuotePdf);

export default router;
