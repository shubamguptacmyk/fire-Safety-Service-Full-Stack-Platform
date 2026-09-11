import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { authService } from "../services/auth.service";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sanitizeUser } from "../services/auth.service";

function meta(req: Request) {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body, meta(req));
    sendSuccess(res, 201, "Account created successfully", result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    const result = await authService.login(identifier, password, meta(req));
    sendSuccess(res, 200, "Logged in successfully", result);
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken, meta(req));
    sendSuccess(res, 200, "Token refreshed", result);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.logout(refreshToken);
    sendSuccess(res, 200, "Logged out successfully");
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAllDevices(req.user!.id);
    sendSuccess(res, 200, "Logged out of all devices");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw ApiError.notFound("User not found");
    sendSuccess(res, 200, "Current user", sanitizeUser(user));
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    sendSuccess(res, 200, result.message);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    sendSuccess(res, 200, result.message);
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const token = (req.body?.token || req.query?.token) as string;
    if (!token || typeof token !== "string" || token.trim().length < 10) {
      throw ApiError.badRequest("Verification token is required");
    }
    const result = await authService.verifyEmail(token);
    sendSuccess(res, 200, result.message, result);
  }),

  resendVerification: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.resendVerification(email);
    sendSuccess(res, 200, result.message, result);
  }),

  resendVerificationEmail: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.sendEmailVerification(req.user!.id);
    sendSuccess(res, 200, result.message, result);
  }),
};
