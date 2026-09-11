import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { runEquipmentReminderScan } from "../jobs/reminder.cron";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const unreadOnly = req.query.unread === "true";

  const result = await NotificationService.getUserNotifications(userId, { page, limit, unreadOnly });

  return res.status(200).json({
    success: true,
    message: "Notifications retrieved",
    data: result.items,
    meta: {
      total: result.total,
      unreadCount: result.unreadCount,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  const updated = await NotificationService.markAsRead(req.params.id, userId);
  if (!updated) throw ApiError.notFound("Notification not found");

  return ApiResponse.success(res, "Notification marked as read", updated);
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  await NotificationService.markAllAsRead(userId);
  return ApiResponse.success(res, "All notifications marked as read");
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");
  const role = (req as any).user?.role;
  const isAdmin = ["super_admin", "admin"].includes(role);

  const deleted = await NotificationService.deleteNotification(req.params.id, userId, isAdmin);
  if (!deleted) throw ApiError.notFound("Notification not found");

  return ApiResponse.success(res, "Notification deleted successfully");
});

export const getAdminNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const type = req.query.type as string | undefined;
  const isRead = req.query.isRead !== undefined ? req.query.isRead === "true" : undefined;
  const userId = req.query.userId as string | undefined;

  const result = await NotificationService.getAdminNotifications({ page, limit, type, isRead, userId });

  return res.status(200).json({
    success: true,
    message: "Admin notifications retrieved",
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

export const triggerReminderScanManual = asyncHandler(async (_req: Request, res: Response) => {
  const result = await runEquipmentReminderScan();
  return ApiResponse.success(res, "Automated reminder engine scan executed", result);
});
