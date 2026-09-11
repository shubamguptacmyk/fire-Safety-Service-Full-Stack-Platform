import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { Permission } from "../utils/permissions";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: string; permissions: Permission[] };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }
  const token = header.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, permissions: payload.permissions as Permission[] };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired access token"));
  }
}

// Every protected backend route checks this explicitly — the frontend hiding
// a nav item or button is never treated as the real authorization boundary.
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    const hasAll = permissions.every((p) => req.user!.permissions.includes(p));
    if (!hasAll) return next(ApiError.forbidden(`Missing required permission: ${permissions.join(", ")}`));
    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

// Optional auth: attaches req.user if a valid token is present, but never rejects.
// Useful for endpoints like product listing where logged-in customers might see
// wishlist state but anonymous visitors can still browse.
export function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.split(" ")[1]);
      req.user = { id: payload.sub, role: payload.role, permissions: payload.permissions as Permission[] };
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
}
