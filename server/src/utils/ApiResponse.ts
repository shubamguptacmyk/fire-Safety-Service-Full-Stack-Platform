import { Response } from "express";

export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

// Enforces the consistent { success, message, data, meta } envelope from spec section 47.
export function sendSuccess<T>(res: Response, statusCode: number, message: string, data?: T, meta?: Meta) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? undefined,
  });
}

export function sendError(res: Response, statusCode: number, message: string, errors: unknown[] = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export class ApiResponse {
  static success<T>(res: Response, message: string, data?: T) {
    return sendSuccess(res, 200, message, data);
  }

  static created<T>(res: Response, message: string, data?: T) {
    return sendSuccess(res, 201, message, data);
  }

  static paginated<T>(res: Response, message: string, data: T[], meta: Meta) {
    return sendSuccess(res, 200, message, data, meta);
  }
}
