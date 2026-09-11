import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { AuditLog } from "../models/AuditLog";
import { EmailService } from "../services/email.service";

const app = createApp();

jest.setTimeout(30000);

let sendEmailSpy: jest.SpyInstance;

beforeAll(async () => {
  await connectDB();
  sendEmailSpy = jest.spyOn(EmailService, "sendEmailVerification").mockResolvedValue(true as any);
  await User.deleteMany({
    $or: [
      { email: /test-suite-.*@example.com/ },
      { phone: /^98700/ },
    ],
  });
});

afterAll(async () => {
  if (sendEmailSpy) sendEmailSpy.mockRestore();
  await User.deleteMany({
    $or: [
      { email: /test-suite-.*@example.com/ },
      { phone: /^98700/ },
    ],
  });
  await AuditLog.deleteMany({ module: "admin_management" });
  await mongoose.disconnect();
});

describe("Comprehensive Auth & Admin Management Test Suite", () => {
  let superAdminToken: string;
  let superAdminId: string;
  let createdAdminId: string;
  let customerToken: string;
  let salesToken: string;

  const superAdminData = {
    name: "Test Suite Super Admin",
    email: "test-suite-superadmin@example.com",
    phone: "9870000001",
    password: "SuperSecret123!",
    role: "super_admin",
    isEmailVerified: true,
  };

  const customerData = {
    name: "Test Suite Customer",
    phone: "9870000002",
    email: "test-suite-customer@example.com",
    password: "CustomerPass123!",
  };

  const salesData = {
    name: "Test Suite Sales",
    email: "test-suite-sales@example.com",
    phone: "9870000003",
    password: "SalesPass123!",
    role: "sales",
    isEmailVerified: true,
  };

  beforeAll(async () => {
    // Seed initial test actors
    const superAdmin = await User.create({
      name: superAdminData.name,
      email: superAdminData.email,
      phone: superAdminData.phone,
      passwordHash: superAdminData.password,
      role: superAdminData.role,
      isEmailVerified: true,
      isActive: true,
    });
    superAdminId = superAdmin._id.toString();

    await User.create({
      name: salesData.name,
      email: salesData.email,
      phone: salesData.phone,
      passwordHash: salesData.password,
      role: salesData.role,
      isEmailVerified: true,
      isActive: true,
    });

    // Obtain super admin token
    const saLogin = await request(app).post("/api/auth/login").send({
      identifier: superAdminData.email,
      password: superAdminData.password,
    });
    superAdminToken = saLogin.body.data.accessToken;

    // Obtain sales token
    const salesLogin = await request(app).post("/api/auth/login").send({
      identifier: salesData.email,
      password: salesData.password,
    });
    salesToken = salesLogin.body.data.accessToken;
  });

  // 1. Customer Registration & Email Verification Flow
  describe("1. Customer Registration & Email Verification Flow", () => {
    it("requires email for Individual customer registration", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Ramesh Individual",
        phone: "9870000010",
        password: "Password123!",
        customerType: "b2c",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("registers Business customer as unverified, requires verification before login", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Suresh Business",
        phone: "9870000011",
        email: "test-suite-business@example.com",
        password: "Password123!",
        customerType: "b2b",
        companyName: "SafeTech Solutions LLP",
        gstNumber: "27AABCS1429B1Z1",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeUndefined();
      expect(res.body.data.user.isEmailVerified).toBe(false);
      expect(res.body.data.user.companyName).toBe("SafeTech Solutions LLP");
      expect(res.body.data.user.gstNumber).toBe("27AABCS1429B1Z1");

      // Verify unverified user cannot log in
      const unverifiedLogin = await request(app).post("/api/auth/login").send({
        identifier: "test-suite-business@example.com",
        password: "Password123!",
      });
      expect(unverifiedLogin.status).toBe(403);
      expect(unverifiedLogin.body.message).toContain("verify your email address");

      // Verify email
      await User.updateOne({ email: "test-suite-business@example.com" }, { isEmailVerified: true });

      // After verification, login succeeds and returns token
      const loginRes = await request(app).post("/api/auth/login").send({
        identifier: "test-suite-business@example.com",
        password: "Password123!",
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.accessToken).toBeDefined();

      // Save customer token for RBAC test later
      customerToken = loginRes.body.data.accessToken;
    });

    it("rejects Business / Corporate registration if Company Name is missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Corporate Client",
        phone: "9870000012",
        email: "test-suite-corporate@example.com",
        password: "Password123!",
        customerType: "corporate",
        // companyName missing
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects duplicate mobile number", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Duplicate Phone User",
        phone: "9870000011", // already used
        email: "unique-dup-phone@example.com",
        password: "Password123!",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("phone number already exists");
    });

    it("rejects duplicate email address", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Duplicate Email User",
        phone: "9870000013",
        email: "test-suite-business@example.com", // already used
        password: "Password123!",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("email address already exists");
    });

    it("rejects invalid mobile number format", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Invalid Phone User",
        phone: "12345", // invalid
        email: "test-invalid-phone@example.com",
        password: "Password123!",
      });

      expect(res.status).toBe(400);
    });

    it("rejects short password less than 8 characters", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Short Pass User",
        phone: "9870000014",
        email: "test-short-pass@example.com",
        password: "short",
      });

      expect(res.status).toBe(400);
    });
  });

  // 2. Admin Management APIs & Operations
  describe("2. Admin & Staff Management (Super Admin & RBAC)", () => {
    it("super_admin can retrieve admin and staff user directory", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);

      // Verify passwordHash is never returned in list
      res.body.data.users.forEach((u: any) => {
        expect(u.passwordHash).toBeUndefined();
      });
    });

    it("super_admin can create a new admin account", async () => {
      const newAdminData = {
        name: "Test Operations Admin",
        email: "test-suite-opsadmin@example.com",
        phone: "9870000020",
        password: "TempPassword123!",
        role: "admin",
        isActive: true,
      };

      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(newAdminData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("admin");
      expect(res.body.data.name).toBe(newAdminData.name);
      expect(res.body.data.passwordHash).toBeUndefined();

      createdAdminId = res.body.data.id;

      // Verify audit log created
      const audit = await AuditLog.findOne({
        action: "admin_created",
        entityId: createdAdminId,
      });
      expect(audit).not.toBeNull();
      expect(audit?.details).toBeDefined();
    });

    it("super_admin can update admin role and details", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${createdAdminId}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          role: "sales",
          name: "Test Ops Admin (Updated)",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe("sales");
      expect(res.body.data.name).toBe("Test Ops Admin (Updated)");

      // Verify audit log for role change
      const audit = await AuditLog.findOne({
        action: "admin_role_changed",
        entityId: createdAdminId,
      });
      expect(audit).not.toBeNull();
    });

    it("super_admin can deactivate and activate admin account", async () => {
      // Deactivate
      const deactRes = await request(app)
        .patch(`/api/admin/users/${createdAdminId}/status`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({ isActive: false });

      expect(deactRes.status).toBe(200);
      expect(deactRes.body.data.isActive).toBe(false);

      // Verify audit log for deactivation
      const deactAudit = await AuditLog.findOne({
        action: "admin_deactivated",
        entityId: createdAdminId,
      });
      expect(deactAudit).not.toBeNull();

      // Reactivate
      const actRes = await request(app)
        .patch(`/api/admin/users/${createdAdminId}/status`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({ isActive: true });

      expect(actRes.status).toBe(200);
      expect(actRes.body.data.isActive).toBe(true);

      const actAudit = await AuditLog.findOne({
        action: "admin_activated",
        entityId: createdAdminId,
      });
      expect(actAudit).not.toBeNull();
    });

    it("super_admin can change another admin's password", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${createdAdminId}/change-password`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          password: "BrandNewPassword123!",
          confirmPassword: "BrandNewPassword123!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify audit log (must never log password!)
      const audit = await AuditLog.findOne({
        action: "admin_password_changed",
        entityId: createdAdminId,
      });
      expect(audit).not.toBeNull();
      const auditStr = JSON.stringify(audit);
      expect(auditStr).not.toContain("BrandNewPassword123!");
    });

    it("super_admin can reset admin password generating a temporary password", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${createdAdminId}/reset-password`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.temporaryPassword).toBeDefined();
      expect(res.body.data.temporaryPassword.length).toBeGreaterThanOrEqual(10);
      expect(res.body.data.mustChangePassword).toBe(true);

      const tempPass = res.body.data.temporaryPassword;

      // Verify audit log does not leak the temporary password
      const audit = await AuditLog.findOne({
        action: "admin_password_reset",
        entityId: createdAdminId,
      });
      expect(audit).not.toBeNull();
      const auditStr = JSON.stringify(audit);
      expect(auditStr).not.toContain(tempPass);

      // Verify the target admin can log in with this temporary password
      const loginRes = await request(app).post("/api/auth/login").send({
        identifier: "test-suite-opsadmin@example.com",
        password: tempPass,
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.accessToken).toBeDefined();
    });

    it("prevents demoting or deactivating the last active super_admin", async () => {
      // Temporarily mark any other super_admins inactive to test the boundary condition
      const otherAdmins = await User.find({ role: "super_admin", _id: { $ne: superAdminId }, isActive: true });
      await User.updateMany({ role: "super_admin", _id: { $ne: superAdminId } }, { isActive: false });

      try {
        const res = await request(app)
          .patch(`/api/admin/users/${superAdminId}`)
          .set("Authorization", `Bearer ${superAdminToken}`)
          .send({
            isActive: false,
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("last active Super Admin");
      } finally {
        if (otherAdmins.length > 0) {
          await User.updateMany({ _id: { $in: otherAdmins.map((u) => u._id) } }, { isActive: true });
        }
      }
    });

    it("prevents deleting the last active super_admin", async () => {
      // Create a second temporary super_admin to test non-self delete attempt on a solitary super admin
      const tempSA = await User.create({
        name: "Temporary Super Admin",
        email: "test-suite-temporary-sa@example.com",
        phone: "9870000077",
        passwordHash: "TempSecret123!",
        role: "super_admin",
        isActive: true,
        isEmailVerified: true,
      });

      // Mark all other super_admins inactive so tempSA is the only active one
      await User.updateMany({ role: "super_admin", _id: { $ne: tempSA._id } }, { isActive: false });

      try {
        const res = await request(app)
          .delete(`/api/admin/users/${tempSA._id}`)
          .set("Authorization", `Bearer ${superAdminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("last active Super Admin");
      } finally {
        await User.findByIdAndDelete(tempSA._id);
        await User.updateMany({ role: "super_admin" }, { isActive: true });
      }
    });

    it("prevents an administrator from deleting their own account", async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${superAdminId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("cannot delete your own account");
    });
  });

  // 3. RBAC Enforcement & Route Protection
  describe("3. RBAC Security & Unauthorized Access Denial", () => {
    it("rejects unauthorized customer access to GET /api/admin/users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it("rejects unauthorized customer access to POST /api/admin/users", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Hack Admin",
          phone: "9870000099",
          email: "hack@example.com",
          password: "Password123!",
          role: "super_admin",
        });

      expect(res.status).toBe(403);
    });

    it("rejects sales staff from creating admin users (admins.manage required)", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${salesToken}`)
        .send({
          name: "Unauthorized Staff",
          phone: "9870000098",
          email: "unauth@example.com",
          password: "Password123!",
          role: "admin",
        });

      expect(res.status).toBe(403);
    });

    it("rejects unauthenticated requests without token", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
    });
  });
});
