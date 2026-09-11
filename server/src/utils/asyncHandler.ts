import { Request, Response, NextFunction, RequestHandler } from "express";

// Wraps async route handlers so rejected promises reach the central error
// handler instead of crashing the process or hanging the request.
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
