import { Request, Response } from "express";
import { AMCService } from "../services/amc.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { amcQuerySchema, recordAMCVisitSchema } from "../validators/amc.validators";
import { generateFormBPdfBuffer } from "../services/pdf.service";

export const createAMCContract = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const contract = await AMCService.createAMCContract(req.body, userId);
  return ApiResponse.created(res, "AMC Contract created successfully", contract);
});

export const getMyAMCContracts = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw ApiError.unauthorized("Authentication required");

  await AMCService.seedDefaultAMCsIfEmpty(userId);
  const contracts = await AMCService.getUserAMCContracts(userId);
  return ApiResponse.success(res, "AMC Contracts retrieved", contracts);
});

export const getAMCById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.read") || permissions.includes("all");

  const contract = await AMCService.getAMCById(req.params.id, userId, isAdmin);
  if (!contract) throw ApiError.notFound("AMC contract not found or access denied");

  return ApiResponse.success(res, "AMC contract details retrieved", contract);
});

export const listAllAMCContracts = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  await AMCService.seedDefaultAMCsIfEmpty(userId);

  const parsed = amcQuerySchema.parse(req.query);
  const result = await AMCService.getAllAMCContracts(parsed);

  return ApiResponse.paginated(res, "AMC contracts list retrieved", result.items, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const updateAMCContract = asyncHandler(async (req: Request, res: Response) => {
  const contract = await AMCService.updateAMCContract(req.params.id, req.body);
  if (!contract) throw ApiError.notFound("AMC contract not found");
  return ApiResponse.success(res, "AMC contract updated successfully", contract);
});

export const recordAMCVisit = asyncHandler(async (req: Request, res: Response) => {
  const parsed = recordAMCVisitSchema.parse(req.body);
  const contract = await AMCService.recordVisit(req.params.id, parsed);
  if (!contract) throw ApiError.notFound("AMC contract not found");
  return ApiResponse.success(res, "AMC visit record updated", contract);
});

export const updateAMCStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) throw ApiError.badRequest("Status is required");
  const contract = await AMCService.updateAMCContract(req.params.id, { status });
  if (!contract) throw ApiError.notFound("AMC contract not found");
  return ApiResponse.success(res, `AMC contract status updated to ${contract.status}`, contract);
});

export const downloadFormBPdf = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const permissions = (req as any).user?.permissions || [];
  const isAdmin = permissions.includes("services.read") || permissions.includes("all");

  const contract = await AMCService.getAMCById(req.params.id, userId, isAdmin);
  if (!contract) throw ApiError.notFound("AMC contract not found or access denied");

  const pdfBuffer = await generateFormBPdfBuffer(contract);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="Form-B-${contract.contractNumber}.pdf"`);
  return res.send(pdfBuffer);
});
