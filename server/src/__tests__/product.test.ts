import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { signAccessToken } from "../utils/jwt";
import { permissionsForRole } from "../utils/permissions";

const app = createApp();

let adminToken: string;
let customerToken: string;
let testCategoryId: string;
let testCategorySlug = "test-fire-extinguishers";
let createdProductId: string;

beforeAll(async () => {
  await connectDB();

  // Create or retrieve admin user
  let admin = await User.findOne({ email: "admin-test@example.com" });
  if (!admin) {
    admin = await User.create({
      name: "Admin Test",
      email: "admin-test@example.com",
      phone: "9100000001",
      passwordHash: "Hash123!",
      role: "admin",
      isEmailVerified: true,
    });
  }
  adminToken = signAccessToken({
    sub: admin._id.toString(),
    role: admin.role,
    permissions: permissionsForRole("admin"),
  });

  // Create customer user
  let customer = await User.findOne({ email: "cust-test@example.com" });
  if (!customer) {
    customer = await User.create({
      name: "Cust Test",
      email: "cust-test@example.com",
      phone: "9100000002",
      passwordHash: "Hash123!",
      role: "customer",
      isEmailVerified: true,
    });
  }
  customerToken = signAccessToken({
    sub: customer._id.toString(),
    role: customer.role,
    permissions: permissionsForRole("customer"),
  });

  // Clean up any previous test categories and products
  await Product.deleteMany({ SKU: /^TEST-/ });
  await Category.deleteMany({ slug: testCategorySlug });
});

afterAll(async () => {
  await Product.deleteMany({ SKU: /^TEST-/ });
  await Category.deleteMany({ slug: testCategorySlug });
  await User.deleteMany({ email: { $in: ["admin-test@example.com", "cust-test@example.com"] } });
  await mongoose.disconnect();
});

describe("Category & Product API (Phase 2)", () => {
  describe("Category Management", () => {
    it("allows staff to create a category", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Fire Extinguishers",
          slug: testCategorySlug,
          description: "All test fire extinguishers",
          subcategories: [{ name: "Test ABC", slug: "test-abc" }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe(testCategorySlug);
      testCategoryId = res.body.data._id;
    });

    it("prevents customers from creating categories", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Hacked Category" });

      expect(res.status).toBe(403);
    });

    it("publicly returns category list", async () => {
      const res = await request(app).get("/api/categories");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("Product Management & Filtering", () => {
    it("allows staff to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test ABC Powder Extinguisher 4kg",
          SKU: "TEST-EXT-ABC-01",
          category: testCategoryId,
          brand: "SafeTest",
          description: "Test description with at least five chars",
          shortDescription: "Short test description",
          price: 2500,
          discountPrice: 2200,
          stock: 20,
          capacity: "4 kg",
          fireClass: ["Class A", "Class B"],
          features: ["Feature 1", "Feature 2"],
          specifications: [{ key: "Test Key", value: "Test Value" }],
          images: [{ url: "https://example.com/test.jpg", isPrimary: true }],
          isFeatured: true,
          isBestSeller: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.SKU).toBe("TEST-EXT-ABC-01");
      createdProductId = res.body.data._id;
    });

    it("rejects duplicate SKU creation", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Duplicate SKU Extinguisher",
          SKU: "TEST-EXT-ABC-01",
          category: testCategoryId,
          brand: "SafeTest",
          description: "Test description duplicate",
          price: 1500,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("allows public to query products with pagination", async () => {
      const res = await request(app).get("/api/products?page=1&limit=10");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
    });

    it("filters products by category and search keyword", async () => {
      const res = await request(app).get(
        `/api/products?category=${testCategorySlug}&search=SafeTest`
      );
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].SKU).toBe("TEST-EXT-ABC-01");
    });

    it("fetches single product by slug including related products", async () => {
      const res = await request(app).get(
        "/api/products/slug/test-abc-powder-extinguisher-4kg"
      );
      expect(res.status).toBe(200);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.SKU).toBe("TEST-EXT-ABC-01");
      expect(Array.isArray(res.body.data.relatedProducts)).toBe(true);
    });

    it("updates product stock level", async () => {
      const res = await request(app)
        .patch(`/api/products/${createdProductId}/stock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ stock: 50 });

      expect(res.status).toBe(200);
      expect(res.body.data.stock).toBe(50);
    });

    it("returns filter options metadata", async () => {
      const res = await request(app).get("/api/products/filters");
      expect(res.status).toBe(200);
      expect(res.body.data.brands).toBeDefined();
      expect(res.body.data.categories).toBeDefined();
      expect(res.body.data.fireClasses).toBeDefined();
    });

    it("deletes a product with admin permission", async () => {
      const res = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
