import { Request, Response } from "express";
import { TechnicianService } from "../services/technician.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { technicianQuerySchema } from "../validators/technician.validators";
import { Technician } from "../models/Technician";

export const listTechnicians = asyncHandler(async (req: Request, res: Response) => {
  const parsed = technicianQuerySchema.parse(req.query);
  const technicians = await TechnicianService.getAllTechnicians({
    status: parsed.status,
    search: parsed.search,
    area: parsed.area,
  });
  return ApiResponse.success(res, "Technicians list retrieved", technicians);
});

export const getTechnicianById = asyncHandler(async (req: Request, res: Response) => {
  const technician = await TechnicianService.getTechnicianById(req.params.id);
  if (!technician) throw ApiError.notFound("Technician not found");
  return ApiResponse.success(res, "Technician details retrieved", technician);
});

export const createTechnician = asyncHandler(async (req: Request, res: Response) => {
  const technician = await TechnicianService.createTechnician(req.body);
  return ApiResponse.created(res, "Technician registered successfully", technician);
});

export const updateTechnician = asyncHandler(async (req: Request, res: Response) => {
  const technician = await TechnicianService.updateTechnician(req.params.id, req.body);
  if (!technician) throw ApiError.notFound("Technician not found");
  return ApiResponse.success(res, "Technician updated successfully", technician);
});

export const updateTechnicianStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) throw ApiError.badRequest("Status is required");
  const technician = await TechnicianService.updateTechnician(req.params.id, { status });
  if (!technician) throw ApiError.notFound("Technician not found");
  return ApiResponse.success(res, `Technician status updated to ${technician.status}`, technician);
});

export const deleteTechnician = asyncHandler(async (req: Request, res: Response) => {
  const technician = await TechnicianService.deleteTechnician(req.params.id);
  if (!technician) throw ApiError.notFound("Technician not found");
  return ApiResponse.success(res, "Technician deleted successfully");
});

export const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const userPhone = (req as any).user?.phone;
  // Look up technician document by phone, or id directly
  let tech = await Technician.findOne({ phone: userPhone });
  if (!tech) {
    tech = await Technician.findById(userId);
  }
  const techId = tech ? tech._id : userId;
  const jobs = await TechnicianService.getMyJobs(techId);
  return ApiResponse.success(res, "Technician jobs retrieved", jobs);
});

export const updateJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { status, notes } = req.body;
  const booking = await TechnicianService.updateJobStatus(req.params.id, status, notes, userId);
  return ApiResponse.success(res, `Job status updated to ${booking.status}`, booking);
});

export const addJobPhotos = asyncHandler(async (req: Request, res: Response) => {
  const { photos } = req.body;
  if (!Array.isArray(photos)) throw ApiError.badRequest("Photos array is required");
  const booking = await TechnicianService.addJobPhotos(req.params.id, photos);
  return ApiResponse.success(res, "Job photos uploaded successfully", booking);
});

export const addJobNotes = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { notes } = req.body;
  if (!notes) throw ApiError.badRequest("Notes string is required");
  const booking = await TechnicianService.addJobNotes(req.params.id, notes, userId);
  return ApiResponse.success(res, "Job notes added successfully", booking);
});
