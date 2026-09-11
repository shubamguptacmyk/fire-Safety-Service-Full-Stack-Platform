import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { Coupon } from "../models/Coupon";
import { FAQ } from "../models/FAQ";
import { Banner } from "../models/Banner";
import { BlogPost } from "../models/BlogPost";
import { Gallery } from "../models/Gallery";

const app = createApp();

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await Promise.all([
    Coupon.deleteMany({ code: /^TEST/ }),
    FAQ.deleteMany({ question: /^Test/ }),
    Banner.deleteMany({ title: /^Test/ }),
    BlogPost.deleteMany({ title: /^Test/ }),
    Gallery.deleteMany({ title: /^Test/ }),
  ]);
  await mongoose.disconnect();
});

describe("Operations & Public APIs", () => {
  it("GET /api/health returns database status and uptime", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.database).toBe("connected");
    expect(res.body.version).toBe("2.0.0");
  });

  it("GET /api/settings/public returns company details and tax defaults", async () => {
    const res = await request(app).get("/api/settings/public");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.company).toBeDefined();
    expect(res.body.data.tax.defaultGSTRate).toBe(18);
  });

  it("GET /api/faqs returns active public FAQs", async () => {
    await FAQ.create({
      question: "Test FAQ question?",
      answer: "Test FAQ answer for fire protection.",
      category: "Extinguishers",
      isActive: true,
    });

    const res = await request(app).get("/api/faqs");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/banners returns active banners", async () => {
    await Banner.create({
      title: "Test Banner Promo",
      image: "https://example.com/banner.jpg",
      position: "home_hero",
      isActive: true,
    });

    const res = await request(app).get("/api/banners");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/gallery returns gallery showcase items", async () => {
    await Gallery.create({
      title: "Test Project Installation",
      imageUrl: "https://example.com/install.jpg",
      category: "installation",
      isActive: true,
    });

    const res = await request(app).get("/api/gallery");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("Validates coupon discount calculations", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Coupon.create({
      code: "TESTSAVE10",
      discountType: "percentage",
      discountValue: 10,
      minimumOrderValue: 500,
      startDate: new Date(),
      endDate: tomorrow,
      isActive: true,
    });

    const res = await request(app)
      .post("/api/coupons/validate")
      .send({ code: "TESTSAVE10", orderAmount: 1000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountAmount).toBe(100);
    expect(res.body.data.finalAmount).toBe(900);
  });
});
