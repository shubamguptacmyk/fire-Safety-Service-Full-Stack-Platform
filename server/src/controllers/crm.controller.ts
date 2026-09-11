import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { CRMService } from "../services/crm.service";

export const crmController = {
  getCustomers: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = req.query.search as string | undefined;
    const customerType = req.query.customerType as string | undefined;
    const tier = req.query.tier as string | undefined;

    const result = await CRMService.getCustomers({ search, customerType, tier, page, limit });
    sendSuccess(res, 200, "Customers list retrieved", result);
  }),

  getCustomer360: asyncHandler(async (req: Request, res: Response) => {
    const result = await CRMService.getCustomer360(req.params.id);
    sendSuccess(res, 200, "Customer 360 profile", result);
  }),

  updateCustomerNotesAndTags: asyncHandler(async (req: Request, res: Response) => {
    const { notes, tags } = req.body;
    const result = await CRMService.updateCustomerNotesAndTags(req.params.id, { notes, tags });
    sendSuccess(res, 200, "Customer notes and tags updated", result);
  }),
};
