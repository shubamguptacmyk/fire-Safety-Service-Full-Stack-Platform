import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ReportService } from "../services/report.service";
import { ExportService } from "../services/export.service";

export const reportController = {
  getSalesReport: asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, category, product, customer, status } = req.query as {
      startDate?: string;
      endDate?: string;
      category?: string;
      product?: string;
      customer?: string;
      status?: string;
    };
    const data = await ReportService.getSalesReport({ startDate, endDate, category, product, customer, status });
    sendSuccess(res, 200, "Sales report", data);
  }),

  getRevenueReport: asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, customer, status } = req.query as {
      startDate?: string;
      endDate?: string;
      customer?: string;
      status?: string;
    };
    const data = await ReportService.getRevenueReport({ startDate, endDate, customer, status });
    sendSuccess(res, 200, "Revenue report", data);
  }),

  getProductsReport: asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, product, customer } = req.query as {
      startDate?: string;
      endDate?: string;
      product?: string;
      customer?: string;
    };
    const data = await ReportService.getProductsReport({ startDate, endDate, product, customer });
    sendSuccess(res, 200, "Products sales report", data);
  }),

  getCategoriesReport: asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const data = await ReportService.getCategoriesReport({ startDate, endDate });
    sendSuccess(res, 200, "Categories performance report", data);
  }),

  getCustomersReport: asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, category } = req.query as {
      startDate?: string;
      endDate?: string;
      category?: string;
    };
    const data = await ReportService.getCustomersReport({ startDate, endDate, category });
    sendSuccess(res, 200, "Customers report", data);
  }),

  getServicesReport: asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const data = await ReportService.getServicesReport({ startDate, endDate });
    sendSuccess(res, 200, "Services and inspections report", data);
  }),

  getAMCReport: asyncHandler(async (_req: Request, res: Response) => {
    const data = await ReportService.getAMCReport();
    sendSuccess(res, 200, "AMC contracts and Form B compliance report", data);
  }),

  getInventoryReport: asyncHandler(async (_req: Request, res: Response) => {
    const data = await ReportService.getInventoryReport();
    sendSuccess(res, 200, "Inventory and stock report", data);
  }),

  exportOrders: asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as string) === "csv" ? "csv" : "xlsx";
    const buffer = await ExportService.exportOrders({}, format);

    const contentType =
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const filename = `orders_export_${Date.now()}.${format}`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  }),

  exportCustomers: asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as string) === "csv" ? "csv" : "xlsx";
    const buffer = await ExportService.exportCustomers(format);

    const contentType =
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const filename = `customers_export_${Date.now()}.${format}`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  }),

  exportProducts: asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as string) === "csv" ? "csv" : "xlsx";
    const buffer = await ExportService.exportProducts(format);

    const contentType =
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const filename = `products_export_${Date.now()}.${format}`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  }),

  exportServices: asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as string) === "csv" ? "csv" : "xlsx";
    const buffer = await ExportService.exportServices(format);

    const contentType =
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const filename = `services_export_${Date.now()}.${format}`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  }),

  exportSales: asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as string) === "csv" ? "csv" : "xlsx";
    const buffer = await ExportService.exportOrders({}, format);

    const contentType =
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const filename = `sales_export_${Date.now()}.${format}`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  }),
};
