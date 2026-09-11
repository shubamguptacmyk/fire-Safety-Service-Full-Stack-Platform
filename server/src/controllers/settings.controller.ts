import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { SettingsService } from "../services/settings.service";

export const settingsController = {
  getPublicSettings: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await SettingsService.getPublicSettings();
    sendSuccess(res, 200, "Public platform settings", settings);
  }),

  getAllSettings: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await SettingsService.getAll();
    sendSuccess(res, 200, "All platform settings", settings);
  }),

  getSettingByKey: asyncHandler(async (req: Request, res: Response) => {
    const data = await SettingsService.getByKey(req.params.key);
    sendSuccess(res, 200, `Settings for ${req.params.key}`, data);
  }),

  updateSetting: asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const { data } = req.body;
    const setting = await SettingsService.update(key, data || req.body, req.user?.id);
    sendSuccess(res, 200, `Settings updated for ${key}`, setting);
  }),
};
