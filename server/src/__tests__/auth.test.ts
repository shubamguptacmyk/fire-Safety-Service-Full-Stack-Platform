import request from "supertest";
import mongoose from "mongoose";
import crypto from "crypto";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { EmailService } from "../services/email.service";

const app = createApp();

jest.setTimeout(30000);

let sendEmailSpy: jest.SpyInstance;
let capturedVerificationToken: string = "";

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({
    $or: [
      { email: /test-.*@example\.com/ },
      { phone: /^91234567/ },
      { email: /test-resend@example\.com/ },
    ],
  });

  // Spy on EmailService to verify email dispatch without requiring live network calls in tests
  sendEmailSpy = jest.spyOn(EmailService, "sendEmailVerification").mockImplementation(async (to, name, url) => {
    const match = url.match(/token=([a-f0-9]+)/);
    if (match) {
      capturedVerificationToken = match[1];
    }
    return true;
  });
});

afterAll(async () => {
  await User.deleteMany({
    $or: [
      { email: /test-.*@example\.com/ },
      { phone: /^91234567/ },
      { email: /test-resend@example\.com/ },
    ],
  });
  if (sendEmailSpy) sendEmailSpy.mockRestore();
  await mongoose.disconnect();
});

describe("Customer Registration & Required Email Verification", () => {
  // 1. Registration requires email
  it("1. Registration requires email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "No Email User",
      phone: "9123456701",
      password: "StrongPass123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 2. Invalid email rejected
  it("2. Invalid email rejected", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Invalid Email User",
      phone: "9123456701",
      email: "not-a-valid-email",
      password: "StrongPass123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 3. Valid registration creates unverified account
  it("3. Valid registration creates unverified account", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Unverified Customer",
      phone: "9123456702",
      email: "test-unverified@example.com",
      password: "StrongPass123!",
      customerType: "b2c",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe("customer");
    expect(res.body.data.user.isEmailVerified).toBe(false);

    const dbUser = await User.findOne({ email: "test-unverified@example.com" }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );
    expect(dbUser).not.toBeNull();
    expect(dbUser?.isEmailVerified).toBe(false);
    expect(dbUser?.emailVerificationToken).toBeDefined();
    expect(dbUser?.emailVerificationExpires).toBeDefined();
  });

  // 4. Registration does not return authenticated customer session
  it("4. Registration does not return authenticated customer session", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Session Test Customer",
      phone: "9123456703",
      email: "test-session@example.com",
      password: "StrongPass123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeUndefined();
    expect(res.body.data.refreshToken).toBeUndefined();
    expect(res.body.data.requiresEmailVerification).toBe(true);
  });

  // 5. Verification email is triggered
  it("5. Verification email is triggered", async () => {
    expect(sendEmailSpy).toHaveBeenCalled();
    expect(capturedVerificationToken).toBeTruthy();
    expect(capturedVerificationToken.length).toBeGreaterThanOrEqual(32);
  });

  // 6. Unverified customer cannot login
  it("6. Unverified customer cannot login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      identifier: "test-unverified@example.com",
      password: "StrongPass123!",
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Please verify your email address before logging in.");
  });

  // 7. Valid verification token verifies account
  it("7. Valid verification token verifies account", async () => {
    // Obtain valid token for test-unverified@example.com
    sendEmailSpy.mockClear();
    capturedVerificationToken = "";

    // Trigger resend to capture fresh token for test-unverified
    await User.updateOne({ email: "test-unverified@example.com" }, { $unset: { emailVerificationSentAt: 1 } });
    await request(app).post("/api/auth/resend-verification").send({
      email: "test-unverified@example.com",
    });

    expect(capturedVerificationToken).toBeTruthy();

    const res = await request(app).post("/api/auth/verify-email").send({
      token: capturedVerificationToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Email verified successfully");

    const dbUser = await User.findOne({ email: "test-unverified@example.com" }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );
    expect(dbUser?.isEmailVerified).toBe(true);
    expect(dbUser?.emailVerificationToken).toBeUndefined();
    expect(dbUser?.emailVerificationExpires).toBeUndefined();
  });

  // 8. Expired token rejected
  it("8. Expired token rejected", async () => {
    const expiredRawToken = "expired-token-1234567890abcdef";
    const hashed = crypto.createHash("sha256").update(expiredRawToken).digest("hex");

    await User.create({
      name: "Expired Token User",
      email: "test-expired@example.com",
      phone: "9123456708",
      passwordHash: "Password123!",
      role: "customer",
      isEmailVerified: false,
      emailVerificationToken: hashed,
      emailVerificationExpires: new Date(Date.now() - 3600000), // 1 hour ago
    });

    const res = await request(app).post("/api/auth/verify-email").send({
      token: expiredRawToken,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("expired");
  });

  // 9. Invalid token rejected
  it("9. Invalid token rejected", async () => {
    const res = await request(app).post("/api/auth/verify-email").send({
      token: "completely-invalid-nonexistent-token-12345",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("invalid or has already been used");
  });

  // 10. Already-used token rejected
  it("10. Already-used token rejected", async () => {
    // capturedVerificationToken was already used and cleared in test 7
    const res = await request(app).post("/api/auth/verify-email").send({
      token: capturedVerificationToken,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("invalid or has already been used");
  });

  // 11. Resend verification works
  it("11. Resend verification works", async () => {
    const rawTok = "resend-initial-tok-1234567890abcdef";
    const hashed = crypto.createHash("sha256").update(rawTok).digest("hex");

    await User.create({
      name: "Resend Target Customer",
      email: "test-resend@example.com",
      phone: "9123456709",
      passwordHash: "Password123!",
      role: "customer",
      isEmailVerified: false,
      emailVerificationToken: hashed,
      emailVerificationExpires: new Date(Date.now() + 86400000),
      emailVerificationSentAt: new Date(Date.now() - 120000), // 2 minutes ago (past cooldown)
    });

    sendEmailSpy.mockClear();

    const res = await request(app).post("/api/auth/resend-verification").send({
      email: "test-resend@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cooldown).toBe(60);
    expect(sendEmailSpy).toHaveBeenCalledWith("test-resend@example.com", "Resend Target Customer", expect.any(String));
  });

  // 12. Resend rate limit works
  it("12. Resend rate limit works", async () => {
    // Immediately request again without waiting for cooldown
    const res = await request(app).post("/api/auth/resend-verification").send({
      email: "test-resend@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Please wait");
  });

  // 13. Verified customer can login
  it("13. Verified customer can login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      identifier: "test-unverified@example.com",
      password: "StrongPass123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.isEmailVerified).toBe(true);

    // Verify /me endpoint returns user profile
    const token = res.body.data.accessToken;
    const meRes = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe("test-unverified@example.com");
  });

  // 14. Duplicate email rejected
  it("14. Duplicate email rejected", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Duplicate Email Person",
      phone: "9123456710",
      email: "test-unverified@example.com", // existing
      password: "StrongPass123!",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("email address already exists");
  });

  // 15. Duplicate mobile rejected
  it("15. Duplicate mobile rejected", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Duplicate Phone Person",
      phone: "9123456702", // existing
      email: "test-unique-email@example.com",
      password: "StrongPass123!",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("phone number already exists");
  });

  // 16. Individual registration works
  it("16. Individual registration works", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Aman Individual",
      phone: "9123456711",
      email: "test-individual@example.com",
      password: "StrongPass123!",
      customerType: "b2c",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.customerType).toBe("b2c");
    expect(res.body.data.user.isEmailVerified).toBe(false);
  });

  // 17. Business registration works
  it("17. Business registration works", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Aman Business",
      phone: "9123456712",
      email: "test-business@example.com",
      password: "StrongPass123!",
      customerType: "b2b",
      companyName: "AK Fire Protection LLP",
      gstNumber: "27AABCS1429B1Z1",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.customerType).toBe("b2b");
    expect(res.body.data.user.companyName).toBe("AK Fire Protection LLP");
    expect(res.body.data.user.gstNumber).toBe("27AABCS1429B1Z1");
    expect(res.body.data.user.isEmailVerified).toBe(false);
  });

  // 18. Corporate registration works
  it("18. Corporate registration works", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Aman Corporate",
      phone: "9123456713",
      email: "test-corporate@example.com",
      password: "StrongPass123!",
      customerType: "corporate",
      companyName: "Maharashtra State Enterprise Corp",
      gstNumber: "27AAACM1234F1Z5",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.customerType).toBe("corporate");
    expect(res.body.data.user.companyName).toBe("Maharashtra State Enterprise Corp");
    expect(res.body.data.user.gstNumber).toBe("27AAACM1234F1Z5");
    expect(res.body.data.user.isEmailVerified).toBe(false);
  });
});
