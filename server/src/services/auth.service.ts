import crypto from "crypto";
import { User, IUser } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { ApiError } from "../utils/ApiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { permissionsForRole, Role } from "../utils/permissions";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueTokenPair(user: IUser, meta: { userAgent?: string; ip?: string }) {
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    permissions: permissionsForRole(user.role as Role),
  });
  const refreshToken = signRefreshToken({ sub: user._id.toString(), tokenVersion: user.tokenVersion });

  const decoded = verifyRefreshToken(refreshToken);
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: {
    name: string; phone: string; email: string; password: string;
    customerType?: "b2c" | "b2b" | "corporate"; companyName?: string; gstNumber?: string;
  }, meta: { userAgent?: string; ip?: string }) {
    const trimmedName = input.name.trim();
    const trimmedPhone = input.phone.trim();
    if (!input.email || !input.email.trim()) {
      throw ApiError.badRequest("Email Address is required");
    }
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check duplicate phone or email
    const existing = await User.findOne({
      $or: [{ phone: trimmedPhone }, { email: normalizedEmail }],
    });
    if (existing) {
      if (existing.email === normalizedEmail) {
        throw ApiError.conflict("An account with this email address already exists");
      }
      throw ApiError.conflict("An account with this phone number already exists");
    }

    const customerType = input.customerType || "b2c";
    if ((customerType === "b2b" || customerType === "corporate") && (!input.companyName || !input.companyName.trim())) {
      throw ApiError.badRequest("Company Name is required for Business and Corporate accounts");
    }

    // Generate secure random verification token (hash stored in DB)
    const rawVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawVerificationToken).digest("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: trimmedName,
      phone: trimmedPhone,
      email: normalizedEmail,
      passwordHash: input.password, // hashed by the pre-save hook
      role: "customer",
      customerType,
      companyName: input.companyName?.trim() || undefined,
      gstNumber: input.gstNumber?.trim() || undefined,
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expires,
      emailVerificationSentAt: new Date(),
    });

    // Send verification email with secure link
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${rawVerificationToken}`;
    const { EmailService } = await import("./email.service");
    await EmailService.sendEmailVerification(user.email!, user.name, verificationUrl);

    // Customer MUST NOT be automatically logged in after registration.
    // Return verification-required payload without access or refresh tokens.
    return {
      user: sanitizeUser(user),
      requiresEmailVerification: true,
      message: "We've sent a verification link to your email address. Please verify your email to activate your account.",
    };
  },

  async login(identifier: string, password: string, meta: { userAgent?: string; ip?: string }) {
    const trimmedId = identifier.trim();
    const user = await User.findOne({
      $or: [{ email: trimmedId.toLowerCase() }, { phone: trimmedId }],
    }).select("+passwordHash");

    if (!user) throw ApiError.unauthorized("Invalid credentials");
    if (!user.isActive) throw ApiError.forbidden("Account is deactivated. Please contact support.");

    const valid = await user.comparePassword(password);
    if (!valid) throw ApiError.unauthorized("Invalid credentials");

    // A customer whose email is not verified MUST NOT be allowed to log in
    if (!user.isEmailVerified) {
      throw ApiError.forbidden("Please verify your email address before logging in.", [
        { field: "email", message: "EMAIL_NOT_VERIFIED" },
      ]);
    }

    const tokens = await issueTokenPair(user, meta);
    return { user: sanitizeUser(user), ...tokens };
  },

  async refresh(refreshToken: string, meta: { userAgent?: string; ip?: string }) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const stored = await RefreshToken.findOne({ user: payload.sub, tokenHash: hashToken(refreshToken), revoked: false });
    if (!stored || stored.expiresAt < new Date()) throw ApiError.unauthorized("Refresh token has been revoked or expired");

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized("Session is no longer valid, please log in again");
    }

    // Rotate: revoke the used refresh token and issue a fresh pair.
    stored.revoked = true;
    await stored.save();

    return issueTokenPair(user, meta);
  },

  async logout(refreshToken: string) {
    await RefreshToken.updateOne({ tokenHash: hashToken(refreshToken) }, { revoked: true });
  },

  async logoutAllDevices(userId: string) {
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    await RefreshToken.updateMany({ user: userId }, { revoked: true });
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return gracefully to prevent user enumeration
      return { message: "If your email is registered, you will receive password reset instructions." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    const { EmailService } = await import("./email.service");
    await EmailService.sendPasswordReset(user.email!, resetUrl);

    return { message: "If your email is registered, you will receive password reset instructions." };
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +passwordHash");

    if (!user) {
      throw ApiError.badRequest("Invalid or expired password reset token");
    }

    user.passwordHash = newPassword; // hashed by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Revoke all existing sessions
    await RefreshToken.updateMany({ user: user._id }, { revoked: true });

    return { message: "Password reset successful. You may now log in with your new password." };
  },

  async sendEmailVerification(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.email) {
      throw ApiError.badRequest("No valid email registered for this account");
    }
    if (user.isEmailVerified) {
      return { message: "Email is already verified", alreadyVerified: true };
    }

    return this.resendVerification(user.email);
  },

  async resendVerification(email: string) {
    if (!email || !email.trim()) {
      throw ApiError.badRequest("Email address is required");
    }

    const normalizedInput = email.trim();
    const user = await User.findOne({
      $or: [{ email: normalizedInput.toLowerCase() }, { phone: normalizedInput }],
    }).select(
      "+emailVerificationToken +emailVerificationExpires +emailVerificationSentAt"
    );

    if (!user) {
      // Return gracefully to prevent email enumeration
      return {
        message: "If an account with this email exists, a verification link has been sent.",
        cooldown: 60,
      };
    }

    if (user.isEmailVerified) {
      return {
        message: "This email address is already verified. You can log in directly.",
        alreadyVerified: true,
        cooldown: 0,
      };
    }

    // Rate limiting / cooldown: 60 seconds
    if (user.emailVerificationSentAt) {
      const elapsedMs = Date.now() - new Date(user.emailVerificationSentAt).getTime();
      if (elapsedMs < 60 * 1000) {
        const remainingSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        throw ApiError.badRequest(`Please wait ${remainingSec} seconds before requesting another verification email.`);
      }
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    user.emailVerificationSentAt = new Date();
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

    const { EmailService } = await import("./email.service");
    await EmailService.sendEmailVerification(user.email!, user.name, verificationUrl);

    return {
      message: "Verification email sent successfully. Please check your inbox.",
      cooldown: 60,
    };
  },

  async verifyEmail(token: string) {
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      throw ApiError.badRequest("Verification token is required");
    }

    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      throw ApiError.badRequest(
        "This verification link is invalid or has already been used. If you have already verified your account, you can log in."
      );
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw ApiError.badRequest("This verification link has expired. Please request a new verification email.");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    if (user.email) {
      import("./email.service").then(({ EmailService }) => {
        EmailService.sendWelcome(user.email!, user.name).catch(() => {});
      });
    }

    return { message: "Email verified successfully. You can now log in to your account." };
  },
};

export function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    customerType: user.customerType,
    companyName: user.companyName,
    gstNumber: user.gstNumber,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
  };
}
