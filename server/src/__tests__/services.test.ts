import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { CustomerEquipment } from "../models/CustomerEquipment";
import { Technician } from "../models/Technician";
import { AMCContract } from "../models/AMCContract";
import { ServiceBooking } from "../models/ServiceBooking";
import { NotificationLog } from "../models/NotificationLog";
import { Notification } from "../models/Notification";
import { signAccessToken } from "../utils/jwt";
import { permissionsForRole } from "../utils/permissions";
import { runEquipmentReminderScan } from "../jobs/reminder.cron";

const app = createApp();

let adminToken: string;
let customerToken: string;
let customerId: string;
let testEquipmentId: string;
let testTechnicianId: string;
let testContractId: string;
let testBookingId: string;

beforeAll(async () => {
  await connectDB();

  let admin = await User.findOne({ email: "services-admin@test.com" });
  if (!admin) {
    admin = await User.create({
      name: "Services Admin",
      email: "services-admin@test.com",
      phone: "9199990011",
      passwordHash: "AdminHash123!",
      role: "admin",
      isEmailVerified: true,
    });
  }
  adminToken = signAccessToken({
    sub: admin._id.toString(),
    role: admin.role,
    permissions: permissionsForRole("admin"),
  });

  let customer = await User.findOne({ email: "services-customer@test.com" });
  if (!customer) {
    customer = await User.create({
      name: "Services Customer",
      email: "services-customer@test.com",
      phone: "9199990012",
      passwordHash: "CustHash123!",
      role: "customer",
      isEmailVerified: true,
    });
  }
  customerId = customer._id.toString();
  customerToken = signAccessToken({
    sub: customerId,
    role: customer.role,
    permissions: permissionsForRole("customer"),
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Phase 4: Customer Equipment Management", () => {
  it("should register customer fire extinguisher equipment", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "SafePro 4kg ABC Fire Extinguisher",
        serialNumber: `SN-TEST-${Date.now().toString().slice(-4)}`,
        equipmentType: "ABC Dry Powder",
        capacity: "4kg",
        location: "1st Floor Main Electrical Shaft",
        installationDate: "2024-01-15",
        lastInspectionDate: "2024-06-15",
        lastRefillDate: "2024-01-15",
        nextInspectionDate: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
        nextRefillDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
        notes: "IS 15683 compliant extinguisher",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("equipmentId");
    expect(res.body.data.status).toBe("Healthy");
    testEquipmentId = res.body.data._id;
  });

  it("should fetch customer equipment list with metrics", async () => {
    const res = await request(app)
      .get("/api/equipment/my")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("stats");
    expect(res.body.stats.total).toBeGreaterThan(0);
  });

  it("should calculate 'Refill Due Soon' if refill date is within 30 days", async () => {
    const dueSoonDate = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
    const res = await request(app)
      .put(`/api/equipment/${testEquipmentId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        nextRefillDate: dueSoonDate,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Refill Due Soon");
  });
});

describe("Phase 4: Technician Fleet Management", () => {
  it("should list technicians and seed defaults if empty", async () => {
    const res = await request(app).get("/api/technicians");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    testTechnicianId = res.body.data[0]._id;
  });

  it("should register a new certified technician", async () => {
    const res = await request(app)
      .post("/api/technicians")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Anil Deshmukh",
        phone: "9820443322",
        email: "anil.d@akfiresafety.com",
        employeeId: `TECH-${Date.now().toString().slice(-3)}`,
        skills: ["Hydrant Servicing", "Sprinkler Flow Testing"],
        serviceArea: "Navi Mumbai - Vashi / Sanpada",
        status: "active",
        licenseNumber: "MFS-TECH-0881",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Anil Deshmukh");
  });
});

describe("Phase 4: AMC Contract Operations", () => {
  it("should create an AMC contract with scheduled quarterly visits", async () => {
    const res = await request(app)
      .post("/api/amc")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        userId: customerId,
        clientName: "Seawoods Estates Association",
        companyName: "Seawoods CHS",
        phone: "9820998877",
        email: "seawoods@test.com",
        premisesType: "Residential High-Rise",
        location: "Sector 54, Seawoods, Navi Mumbai",
        planName: "Comprehensive Residential AMC",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        renewalDate: "2026-12-31",
        frequency: "Quarterly",
        assignedTechnician: testTechnicianId,
        equipmentCount: 36,
        annualValue: 38000,
        notes: "Covers 2 towers and clubhouse hydrant system",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("contractNumber");
    expect(res.body.data.visitsScheduled.length).toBe(4);
    expect(res.body.data.formBStatus).toBe("Current");
    testContractId = res.body.data._id;
  });

  it("should record completion of an AMC scheduled visit", async () => {
    const res = await request(app)
      .post(`/api/amc/${testContractId}/visits`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        visitNumber: 1,
        status: "Completed",
        completedDate: new Date().toISOString(),
        notes: "Q1 routine inspection completed. All gauges verified.",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.visitsCompleted).toBe(1);
  });
});

describe("Phase 4: Service Booking & Job Card Completion", () => {
  it("should create a service booking request", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        customerName: "Services Customer",
        phone: "9199990012",
        email: "services-customer@test.com",
        serviceType: "Cylinder Refilling",
        serviceAddress: {
          street: "Plot 88, Sector 19A",
          city: "Navi Mumbai",
          state: "Maharashtra",
          pincode: "400706",
        },
        preferredDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        preferredTime: "Morning (10:00 AM - 1:00 PM)",
        equipmentDetails: "4x 6kg ABC Extinguishers",
        problemDescription: "Discharged during safety drill; need refilling & testing",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("bookingId");
    expect(res.body.data.status).toBe("Requested");
    testBookingId = res.body.data._id;
  });

  it("should allow admin to assign technician and update status", async () => {
    const res = await request(app)
      .patch(`/api/services/${testBookingId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "Assigned",
        assignedTechnician: testTechnicianId,
        notes: "Assigned lead technician for morning slot",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Assigned");
    expect(res.body.data).toHaveProperty("assignedTechnicianName");
  });

  it("should submit Job Card and mark service completed", async () => {
    const res = await request(app)
      .post(`/api/services/${testBookingId}/job-card`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        summary: "Cylinders hydro-tested at 250 bar and refilled with ISI powder.",
        remarks: "Tested per IS 2190. Gauges in green zone.",
        pressureTestPassed: true,
        formBRef: "FORM-B/MFS/2026/9912",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Completed");
    expect(res.body.data.serviceReport.formBRef).toBe("FORM-B/MFS/2026/9912");
  });
});

describe("Phase 4: Cron Reminder Engine & Deduplication", () => {
  it("should run reminder scan and deduplicate notifications", async () => {
    // Run initial scan
    const scan1 = await runEquipmentReminderScan();
    expect(scan1).toHaveProperty("inspectedEquipmentCount");
    expect(scan1).toHaveProperty("remindersDispatched");

    // Run secondary scan immediately: due to NotificationLog, remindersDispatched must be 0 (no duplicate spam!)
    const scan2 = await runEquipmentReminderScan();
    expect(scan2.remindersDispatched).toBe(0);
  });

  it("should expose manual cron trigger API for authorized staff", async () => {
    const res = await request(app)
      .post("/api/notifications/trigger-scan")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("inspectedEquipmentCount");
  });
});
