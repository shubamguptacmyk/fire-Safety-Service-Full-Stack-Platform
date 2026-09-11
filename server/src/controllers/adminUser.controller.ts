import { Request, Response } from "express";
import crypto from "crypto";
import { Types } from "mongoose";
import { User, IUser } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { AuditLog } from "../models/AuditLog";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { Role } from "../utils/permissions";

const STAFF_ROLES: Role[] = ["super_admin", "admin", "sales", "technician", "accountant"];

function sanitizeAdmin(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    mustChangePassword: user.mustChangePassword || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function generateTemporaryPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + numbers + symbols;

  const chars: string[] = [
    upper[crypto.randomInt(0, upper.length)],
    lower[crypto.randomInt(0, lower.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    symbols[crypto.randomInt(0, symbols.length)],
  ];

  for (let i = 4; i < 12; i++) {
    chars.push(all[crypto.randomInt(0, all.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

export const adminUserController = {
  // GET /api/admin/users
  getAdminUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { role: { $in: STAFF_ROLES } };

    if (req.query.role && typeof req.query.role === "string" && STAFF_ROLES.includes(req.query.role as Role)) {
      filter.role = req.query.role;
    }

    if (req.query.status === "active") {
      filter.isActive = true;
    } else if (req.query.status === "inactive") {
      filter.isActive = false;
    }

    if (req.query.search && typeof req.query.search === "string") {
      const s = req.query.search.trim();
      if (s) {
        filter.$or = [
          { name: { $regex: s, $options: "i" } },
          { email: { $regex: s, $options: "i" } },
          { phone: { $regex: s, $options: "i" } },
        ];
      }
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Admin and staff users retrieved", {
      users: users.map(sanitizeAdmin),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  }),

  // GET /api/admin/users/:id
  getAdminUserById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user ID");

    const user = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } });
    if (!user) throw ApiError.notFound("Admin or staff user not found");

    sendSuccess(res, 200, "Admin details retrieved", sanitizeAdmin(user));
  }),

  // POST /api/admin/users
  createAdminUser: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, password, role, isActive } = req.body;

    if (!name || !name.trim()) throw ApiError.badRequest("Name is required");
    if (!email || !email.trim()) throw ApiError.badRequest("Email is required");
    if (!phone || !phone.trim()) throw ApiError.badRequest("Phone number is required");
    if (!password || password.length < 8) throw ApiError.badRequest("Password must be at least 8 characters");
    if (!role || !STAFF_ROLES.includes(role)) {
      throw ApiError.badRequest(`Role must be one of: ${STAFF_ROLES.join(", ")}`);
    }

    // Only super_admin can create super_admin
    if (role === "super_admin" && req.user?.role !== "super_admin") {
      throw ApiError.forbidden("Only a Super Admin can create another Super Admin account.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: trimmedPhone }] });
    if (existing) {
      if (existing.email === normalizedEmail) {
        throw ApiError.conflict("A user with this email address already exists");
      }
      throw ApiError.conflict("A user with this phone number already exists");
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: trimmedPhone,
      passwordHash: password, // Pre-save hook hashes it
      role,
      isActive: isActive !== false,
      isEmailVerified: true, // Admin-created staff accounts are pre-verified
    });

    // Record audit log
    await AuditLog.create({
      user: req.user!.id,
      action: "admin_created",
      module: "admin_management",
      entity: "admin_user",
      entityId: newUser._id.toString(),
      details: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
      ip: req.ip,
    });

    sendSuccess(res, 201, "Admin account created successfully", sanitizeAdmin(newUser));
  }),

  // PATCH /api/admin/users/:id
  updateAdminUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user ID");

    const targetUser = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } });
    if (!targetUser) throw ApiError.notFound("Admin or staff user not found");

    const { name, phone, role, isActive } = req.body;
    let targetIsActive = typeof isActive === "boolean" ? isActive : undefined;
    if (targetIsActive === undefined && typeof req.body.status === "string") {
      targetIsActive = req.body.status.toLowerCase() === "active";
    }

    // Safety: prevent deactivating or demoting the last active super_admin
    if (targetUser.role === "super_admin") {
      const isDemotion = role && role !== "super_admin";
      const isDeactivation = targetIsActive === false;

      if (isDemotion || isDeactivation) {
        const activeSuperAdminCount = await User.countDocuments({
          role: "super_admin",
          isActive: true,
        });

        if (activeSuperAdminCount <= 1) {
          throw ApiError.badRequest("Cannot demote or deactivate the last active Super Admin account.");
        }
      }
    }

    // Role checks: only super_admin can change roles to or from super_admin
    if (role && role !== targetUser.role) {
      if (!STAFF_ROLES.includes(role)) {
        throw ApiError.badRequest(`Role must be one of: ${STAFF_ROLES.join(", ")}`);
      }
      if ((role === "super_admin" || targetUser.role === "super_admin") && req.user?.role !== "super_admin") {
        throw ApiError.forbidden("Only a Super Admin can modify Super Admin roles.");
      }
    }

    // Check phone conflict if phone changed
    if (phone && phone.trim() !== targetUser.phone) {
      const existingPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: targetUser._id } });
      if (existingPhone) throw ApiError.conflict("Phone number is already in use by another account");
      targetUser.phone = phone.trim();
    }

    const oldRole = targetUser.role;
    const oldActive = targetUser.isActive;
    let roleChanged = false;
    let statusChanged = false;

    if (name && name.trim()) targetUser.name = name.trim();
    if (role && role !== oldRole) {
      targetUser.role = role;
      roleChanged = true;
    }
    if (typeof targetIsActive === "boolean" && targetIsActive !== oldActive) {
      targetUser.isActive = targetIsActive;
      statusChanged = true;
    }

    await targetUser.save();

    // Record audit logs
    if (roleChanged) {
      await AuditLog.create({
        user: req.user!.id,
        action: "admin_role_changed",
        module: "admin_management",
        entity: "admin_user",
        entityId: targetUser._id.toString(),
        previousValue: { role: oldRole },
        newValue: { role: targetUser.role },
        details: { name: targetUser.name, email: targetUser.email },
        ip: req.ip,
      });
    }

    if (statusChanged) {
      await AuditLog.create({
        user: req.user!.id,
        action: targetUser.isActive ? "admin_activated" : "admin_deactivated",
        module: "admin_management",
        entity: "admin_user",
        entityId: targetUser._id.toString(),
        previousValue: { isActive: oldActive },
        newValue: { isActive: targetUser.isActive },
        details: { name: targetUser.name, email: targetUser.email },
        ip: req.ip,
      });
    }

    if (!roleChanged && !statusChanged) {
      await AuditLog.create({
        user: req.user!.id,
        action: "admin_updated",
        module: "admin_management",
        entity: "admin_user",
        entityId: targetUser._id.toString(),
        details: { name: targetUser.name, email: targetUser.email },
        ip: req.ip,
      });
    }

    sendSuccess(res, 200, "Admin account updated successfully", sanitizeAdmin(targetUser));
  }),

  // POST /api/admin/users/:id/change-password or PATCH /api/admin/users/:id/password
  changeAdminPassword: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user ID");

    const newPassword = req.body.password || req.body.newPassword;
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      throw ApiError.badRequest("New password must be at least 8 characters");
    }
    if (req.body.confirmPassword && req.body.confirmPassword !== newPassword) {
      throw ApiError.badRequest("Confirm password does not match new password");
    }

    const targetUser = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } });
    if (!targetUser) throw ApiError.notFound("Admin or staff user not found");

    targetUser.passwordHash = newPassword; // Pre-save hook hashes it
    targetUser.mustChangePassword = false;
    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    await targetUser.save();

    // Revoke all active sessions
    await RefreshToken.updateMany({ user: targetUser._id }, { revoked: true });

    // Record audit log (never record password!)
    await AuditLog.create({
      user: req.user!.id,
      action: "admin_password_changed",
      module: "admin_management",
      entity: "admin_user",
      entityId: targetUser._id.toString(),
      details: { targetName: targetUser.name, targetEmail: targetUser.email },
      ip: req.ip,
    });

    sendSuccess(res, 200, "Password changed successfully. All active sessions have been invalidated.");
  }),

  // POST /api/admin/users/:id/reset-password
  resetAdminPassword: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user ID");

    const targetUser = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } });
    if (!targetUser) throw ApiError.notFound("Admin or staff user not found");

    const tempPassword = generateTemporaryPassword();

    targetUser.passwordHash = tempPassword; // Pre-save hook hashes it
    targetUser.mustChangePassword = true;
    targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    await targetUser.save();

    // Invalidate existing sessions
    await RefreshToken.updateMany({ user: targetUser._id }, { revoked: true });

    // Record audit log (never log the temporary password!)
    await AuditLog.create({
      user: req.user!.id,
      action: "admin_password_reset",
      module: "admin_management",
      entity: "admin_user",
      entityId: targetUser._id.toString(),
      details: { targetName: targetUser.name, targetEmail: targetUser.email },
      ip: req.ip,
    });

    sendSuccess(res, 200, "Temporary password generated successfully. Provide this to the user securely.", {
      temporaryPassword: tempPassword,
      mustChangePassword: true,
      message: "This temporary password will be shown only once. The user must change their password upon logging in.",
    });
  }),

  // DELETE /api/admin/users/:id
  deleteAdminUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user ID");

    if (req.user?.id === id) {
      throw ApiError.badRequest("You cannot delete your own account.");
    }

    const targetUser = await User.findOne({ _id: id, role: { $in: STAFF_ROLES } });
    if (!targetUser) throw ApiError.notFound("Admin or staff user not found");

    if (targetUser.role === "super_admin") {
      const activeSuperAdmins = await User.countDocuments({ role: "super_admin", isActive: true });
      if (activeSuperAdmins <= 1) {
        throw ApiError.badRequest("Cannot delete the last active Super Admin account.");
      }
    }

    await User.findByIdAndDelete(id);
    await RefreshToken.updateMany({ user: id }, { revoked: true });

    // Record audit log
    await AuditLog.create({
      user: req.user!.id,
      action: "admin_deleted",
      module: "admin_management",
      entity: "admin_user",
      entityId: id,
      details: { targetName: targetUser.name, targetEmail: targetUser.email, role: targetUser.role },
      ip: req.ip,
    });

    sendSuccess(res, 200, "Admin account deleted successfully");
  }),
};
