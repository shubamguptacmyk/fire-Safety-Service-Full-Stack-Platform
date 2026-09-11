import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { AuditLog } from "../models/AuditLog";

import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";

export const auditController = {
  listLogs: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.userId || req.query.user) {
      const u = (req.query.userId || req.query.user) as string;
      if (Types.ObjectId.isValid(u)) {
        filter.user = new Types.ObjectId(u);
      }
    }
    if (req.query.action) filter.action = req.query.action;
    if (req.query.resource || req.query.module || req.query.entity) {
      const resVal = req.query.resource || req.query.module || req.query.entity;
      filter.$or = [{ module: resVal }, { entity: resVal }];
    }
    if (req.query.resourceId || req.query.entityId) {
      filter.entityId = req.query.resourceId || req.query.entityId;
    }
    if (req.query.ip) filter.ip = req.query.ip;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate as string);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Audit logs retrieved", {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  }),

  getLogById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest("Invalid audit log ID format");
    }
    const log = await AuditLog.findById(id).populate("user", "name email role");
    if (!log) {
      throw ApiError.notFound("Audit log entry not found");
    }
    sendSuccess(res, 200, "Audit log details", log);
  }),
};
