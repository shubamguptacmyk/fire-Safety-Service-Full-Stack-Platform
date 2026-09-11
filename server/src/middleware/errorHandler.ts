import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { sendError } from "../utils/ApiResponse";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Centralized error handler (spec section 55). Never leaks stack traces in production.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error(err.message, err);
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Mongoose validation errors
  if (err && typeof err === "object" && "name" in err && (err as any).name === "ValidationError") {
    const mongooseErr = err as any;
    const errors = Object.values(mongooseErr.errors).map((e: any) => ({ field: e.path, message: e.message }));
    return sendError(res, 400, "Validation failed", errors);
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err && typeof err === "object" && "name" in err && (err as any).name === "CastError") {
    const castErr = err as any;
    return sendError(res, 400, `Invalid ${castErr.path || "ID"} format`);
  }

  // Mongoose duplicate key
  if (err && typeof err === "object" && "code" in err && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    return sendError(res, 409, `${field ? field + " " : ""}already exists`);
  }

  logger.error("Unhandled error", err);
  const message = env.NODE_ENV === "production" ? "Something went wrong. Please try again." : String((err as Error)?.message ?? err);
  return sendError(res, 500, message);
}
