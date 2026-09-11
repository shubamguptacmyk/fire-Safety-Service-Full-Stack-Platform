import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  listAllBookingsAdmin,
  updateBookingStatus,
  submitJobCard,
  cancelBooking,
  assignTechnician,
} from "../controllers/service.controller";
import { requireAuth, requirePermission, attachUserIfPresent } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createServiceBookingSchema,
  updateServiceStatusSchema,
  submitJobCardSchema,
} from "../validators/service.validators";

const router = Router();

// Public / Authenticated booking creation
router.post("/", attachUserIfPresent, validateBody(createServiceBookingSchema), createBooking);
router.post("/book", attachUserIfPresent, validateBody(createServiceBookingSchema), createBooking);

// Customer bookings
router.get("/my", requireAuth, getMyBookings);

// Admin / Staff bookings listing & details
router.get("/all", requireAuth, requirePermission("services.read"), listAllBookingsAdmin);
router.get("/bookings", requireAuth, requirePermission("services.read"), listAllBookingsAdmin);
router.get("/bookings/:id", attachUserIfPresent, getBookingById);
router.patch("/bookings/:id/cancel", requireAuth, cancelBooking);

router.get("/admin", requireAuth, requirePermission("services.read"), listAllBookingsAdmin);
router.get("/admin/:id", requireAuth, requirePermission("services.read"), getBookingById);
router.patch("/admin/:id/status", requireAuth, requirePermission("services.update"), validateBody(updateServiceStatusSchema), updateBookingStatus);
router.post("/admin/:id/assign-technician", requireAuth, requirePermission("services.update"), assignTechnician);

// Single booking details
router.get("/:id", attachUserIfPresent, getBookingById);

// Staff dispatch and Job Card recording
router.patch("/:id/status", requireAuth, requirePermission("services.update"), validateBody(updateServiceStatusSchema), updateBookingStatus);
router.post("/:id/job-card", requireAuth, requirePermission("services.update"), validateBody(submitJobCardSchema), submitJobCard);
router.patch("/:id/cancel", requireAuth, cancelBooking);

export default router;
