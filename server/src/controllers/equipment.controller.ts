import { Request, Response } from "express";
import { EquipmentService } from "../services/equipment.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { equipmentQuerySchema } from "../validators/equipment.validators";

export const createEquipment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required to register equipment");

  const equipment = await EquipmentService.createEquipment(userId, req.body);
  return ApiResponse.created(res, "Equipment registered successfully", equipment);
});

export const getMyEquipment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  const parsedQuery = equipmentQuerySchema.parse(req.query);
  const result = await EquipmentService.getUserEquipment(userId, parsedQuery);

  return res.status(200).json({
    success: true,
    message: "Equipment list retrieved",
    data: result.items,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
    stats: result.stats,
  });
});

export const getEquipmentById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.read") || permissions.includes("all");

  const equipment = await EquipmentService.getEquipmentById(req.params.id, userId, isAdmin);
  if (!equipment) throw ApiError.notFound("Equipment not found or access denied");

  return ApiResponse.success(res, "Equipment details retrieved", equipment);
});

export const getEquipmentByQR = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.read") || permissions.includes("all") || permissions.includes("services.update");

  const equipment = await EquipmentService.getEquipmentByQR(req.params.qrCode, userId, isAdmin);
  if (!equipment) throw ApiError.notFound("Equipment not found for this QR code");

  return ApiResponse.success(res, "Equipment details retrieved by QR code", equipment);
});

export const updateEquipment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.update") || permissions.includes("all");

  const equipment = await EquipmentService.updateEquipment(req.params.id, userId, req.body, isAdmin);
  if (!equipment) throw ApiError.notFound("Equipment not found or update unauthorized");

  return ApiResponse.success(res, "Equipment details updated", equipment);
});

export const deleteEquipment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.delete") || permissions.includes("all");

  const deleted = await EquipmentService.deleteEquipment(req.params.id, userId, isAdmin);
  if (!deleted) throw ApiError.notFound("Equipment not found");

  return ApiResponse.success(res, "Equipment record deleted", deleted);
});

export const listAllEquipmentAdmin = asyncHandler(async (req: Request, res: Response) => {
  const parsedQuery = equipmentQuerySchema.parse(req.query);
  const result = await EquipmentService.getAllEquipmentAdmin(parsedQuery);
  return ApiResponse.paginated(res, "All customer equipment retrieved", result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});
