import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { DashboardService } from "../services/dashboard.service";

export const dashboardController = {
  getOverview: asyncHandler(async (_req: Request, res: Response) => {
    const data = await DashboardService.getOverview();
    sendSuccess(res, 200, "Admin dashboard metrics", data);
  }),

  getSummary: asyncHandler(async (_req: Request, res: Response) => {
    const data = await DashboardService.getSummary();
    sendSuccess(res, 200, "Admin dashboard summary KPIs", data);
  }),

  getRevenue: asyncHandler(async (req: Request, res: Response) => {
    const { period, startDate, endDate } = req.query as {
      period?: string;
      startDate?: string;
      endDate?: string;
    };
    const data = await DashboardService.getRevenue({ period, startDate, endDate });
    sendSuccess(res, 200, "Revenue analytics", data);
  }),

  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const data = await DashboardService.getOrders({ startDate, endDate });
    sendSuccess(res, 200, "Order analytics", data);
  }),

  getCustomers: asyncHandler(async (_req: Request, res: Response) => {
    const data = await DashboardService.getCustomers();
    sendSuccess(res, 200, "Customer analytics", data);
  }),

  getProducts: asyncHandler(async (_req: Request, res: Response) => {
    const data = await DashboardService.getProducts();
    sendSuccess(res, 200, "Product and inventory analytics", data);
  }),

  getServices: asyncHandler(async (_req: Request, res: Response) => {
    const data = await DashboardService.getServices();
    sendSuccess(res, 200, "Service booking analytics", data);
  }),

  getAMC: asyncHandler(async (_req: Request, res: Response) => {
    const data = await DashboardService.getAMC();
    sendSuccess(res, 200, "AMC contract compliance analytics", data);
  }),
};
