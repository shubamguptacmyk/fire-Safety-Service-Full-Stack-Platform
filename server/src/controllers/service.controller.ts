import { Request, Response } from "express";
import { ServiceBookingService } from "../services/service-booking.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  serviceQuerySchema,
  updateServiceStatusSchema,
  submitJobCardSchema,
} from "../validators/service.validators";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const booking = await ServiceBookingService.createBooking(req.body, userId);
  return ApiResponse.created(res, "Service booking created successfully", booking);
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  await ServiceBookingService.seedDefaultBookingsIfEmpty(userId);

  const { status, page, limit } = req.query;
  const result = await ServiceBookingService.getUserBookings(userId, {
    status: status as any,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  return ApiResponse.paginated(res, "Service bookings retrieved", result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.read") || permissions.includes("all");

  const booking = await ServiceBookingService.getBookingById(req.params.id, userId, isAdmin);
  if (!booking) throw ApiError.notFound("Service booking not found");

  return ApiResponse.success(res, "Service booking retrieved", booking);
});

export const listAllBookingsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  await ServiceBookingService.seedDefaultBookingsIfEmpty(userId);

  const parsed = serviceQuerySchema.parse(req.query);
  const result = await ServiceBookingService.getAllBookings(parsed);

  return ApiResponse.paginated(res, "All service bookings retrieved", result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id;
  const parsed = updateServiceStatusSchema.parse(req.body);

  const booking = await ServiceBookingService.updateBookingStatus(req.params.id, parsed, adminId);
  if (!booking) throw ApiError.notFound("Service booking not found");

  return ApiResponse.success(res, `Booking status updated to ${booking.status}`, booking);
});

export const submitJobCard = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id;
  const parsed = submitJobCardSchema.parse(req.body);

  const booking = await ServiceBookingService.submitJobCard(req.params.id, parsed, adminId);
  if (!booking) throw ApiError.notFound("Service booking not found");

  return ApiResponse.success(res, "Job card submitted and service marked completed", booking);
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.update");
  const { reason } = req.body || {};

  const booking = await ServiceBookingService.cancelBooking(req.params.id, isAdmin ? undefined : userId, reason);
  if (!booking) throw ApiError.notFound("Service booking not found");

  return ApiResponse.success(res, "Service booking cancelled successfully", booking);
});

export const assignTechnician = asyncHandler(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id;
  const { technicianId, notes } = req.body;
  if (!technicianId) throw ApiError.badRequest("Technician ID is required");

  const booking = await ServiceBookingService.updateBookingStatus(
    req.params.id,
    {
      status: "Assigned",
      assignedTechnician: technicianId,
      notes,
    },
    adminId
  );
  if (!booking) throw ApiError.notFound("Service booking not found");

  return ApiResponse.success(res, "Technician assigned successfully", booking);
});
