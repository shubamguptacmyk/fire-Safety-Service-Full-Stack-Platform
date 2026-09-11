import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Quote } from "../models/Quote";
import { Invoice } from "../models/Invoice";
import { Cart } from "../models/Cart";
import { Wishlist } from "../models/Wishlist";
import { signAccessToken } from "../utils/jwt";
import { permissionsForRole } from "../utils/permissions";

const app = createApp();

let adminToken: string;
let customerToken: string;
let customerId: string;
let testProductId: string;
let testProductStock = 20;

jest.setTimeout(30000);

beforeAll(async () => {
  await connectDB();

  let admin = await User.findOne({ email: "commerce-admin@test.com" });
  if (!admin) {
    admin = await User.create({
      name: "Commerce Admin",
      email: "commerce-admin@test.com",
      phone: "9199990001",
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

  let customer = await User.findOne({ email: "commerce-customer@test.com" });
  if (!customer) {
    customer = await User.create({
      name: "Commerce Customer",
      email: "commerce-customer@test.com",
      phone: "9199990002",
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

  let category = await Category.findOne({ slug: "commerce-test-cat" });
  if (!category) {
    category = await Category.create({
      name: "Commerce Test Cat",
      slug: "commerce-test-cat",
      sortOrder: 99,
      isActive: true,
    });
  }

  await Product.deleteMany({ SKU: "COMMERCE-TEST-001" });
  const product = await Product.create({
    name: "Commerce Test Fire Extinguisher 4kg",
    slug: "commerce-test-extinguisher-4kg",
    SKU: "COMMERCE-TEST-001",
    category: category._id,
    brand: "SafePro Test",
    description: "Industrial test fire extinguisher",
    price: 2000,
    discountPrice: 1800,
    stock: testProductStock,
    lowStockThreshold: 5,
    minimumOrderQuantity: 1,
    unit: "piece",
    fireClass: ["A", "B", "C"],
    specifications: [{ key: "Working Pressure", value: "15 bar" }],
    features: ["ISI Marked"],
    certifications: ["IS 15683"],
    images: [{ url: "https://example.com/test.jpg", isPrimary: true }],
    isActive: true,
  });

  testProductId = product._id.toString();
});

afterAll(async () => {
  await Order.deleteMany({ "customer.phone": "9199990002" });
  await Quote.deleteMany({ "customer.phone": "9199990002" });
  await Product.deleteMany({ SKU: "COMMERCE-TEST-001" });
  await Category.deleteMany({ slug: "commerce-test-cat" });
  await Cart.deleteMany({ user: new mongoose.Types.ObjectId(customerId) });
  await Wishlist.deleteMany({ user: new mongoose.Types.ObjectId(customerId) });
  await mongoose.disconnect();
});

describe("Phase 3 Commerce: Order Management API", () => {
  let createdOrderId: string;
  let orderNumber: string;

  it("should create an order, calculate 18% GST and atomically deduct stock", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        customer: {
          name: "Commerce Customer",
          phone: "9199990002",
          email: "commerce-customer@test.com",
          companyName: "Safe Test Pvt Ltd",
          gstNumber: "27AABCS1234F1Z9",
        },
        items: [{ productId: testProductId, quantity: 2 }],
        shippingAddress: {
          line1: "Plot 10, MIDC Turbhe",
          city: "Navi Mumbai",
          state: "Maharashtra",
          pincode: "400705",
        },
        deliveryMethod: "standard",
        paymentMethod: "mock",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBeDefined();

    createdOrderId = res.body.data.order._id;
    orderNumber = res.body.data.order.orderNumber;

    // Subtotal: 1800 * 2 = 3600. GST (18%): 648. Shipping (< 5000): 250. Grand Total: 4498
    expect(res.body.data.order.pricing.subtotal).toBe(3600);
    expect(res.body.data.order.pricing.gst).toBe(648);
    expect(res.body.data.order.pricing.grandTotal).toBe(4498);
    expect(res.body.data.order.paymentStatus).toBe("paid");
    expect(res.body.data.order.status).toBe("Confirmed");

    // Verify stock deduction
    const updatedProduct = await Product.findById(testProductId);
    expect(updatedProduct?.stock).toBe(testProductStock - 2);
  });

  it("should reject order if requested quantity exceeds available stock", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        customer: {
          name: "Excess Buyer",
          phone: "9199990003",
        },
        items: [{ productId: testProductId, quantity: 9999 }],
        shippingAddress: {
          line1: "Plot 1",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Insufficient stock/);
  });

  it("should retrieve my customer orders", async () => {
    const res = await request(app)
      .get("/api/orders/my-orders")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((o: any) => o.orderNumber === orderNumber)).toBe(true);
  });

  it("should allow admin to list and update order status to Dispatched", async () => {
    const res = await request(app)
      .patch(`/api/orders/${createdOrderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "Dispatched",
        deliveryDetails: {
          carrier: "V-Trans Safe Express",
          lrNumber: "LR-MH-991122",
        },
        note: "Handed over to transporter hub",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Dispatched");
    expect(res.body.data.deliveryDetails.carrier).toBe("V-Trans Safe Express");
    expect(res.body.data.deliveryDetails.lrNumber).toBe("LR-MH-991122");
  });

  it("should generate and stream GST Tax Invoice PDF", async () => {
    const res = await request(app)
      .get(`/api/orders/${createdOrderId}/invoice`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.body).toBeDefined();
  });
});

describe("Phase 3 Commerce: B2B Quotation API", () => {
  let createdQuoteId: string;
  let quoteNumber: string;

  it("should submit a formal commercial quote request", async () => {
    const res = await request(app)
      .post("/api/quotes")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: "Commercial Buyer",
        companyName: "Apex Logistics Warehouse Ltd",
        phone: "9199990002",
        email: "commerce-customer@test.com",
        gstNumber: "27AABCS1234F1Z9",
        items: [
          {
            productId: testProductId,
            name: "Commerce Test Fire Extinguisher 4kg",
            quantity: 50,
          },
        ],
        requirements: "Required for G+3 commercial warehouse fire compliance certificate.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quoteNumber).toBeDefined();

    createdQuoteId = res.body.data._id;
    quoteNumber = res.body.data.quoteNumber;
    expect(res.body.data.status).toBe("submitted");
  });

  it("should allow admin to update quote pricing and approve", async () => {
    const res = await request(app)
      .put(`/api/quotes/${createdQuoteId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "approved",
        adminNotes: "Approved with 10% volume discount for corporate warehouse.",
        items: [
          {
            name: "Commerce Test Fire Extinguisher 4kg",
            quantity: 50,
            unitPrice: 1600,
            gstPercent: 18,
            total: 80000,
          },
        ],
        pricing: {
          subtotal: 80000,
          gst: 14400,
          grandTotal: 94400,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("approved");
    expect(res.body.data.pricing.grandTotal).toBe(94400);
  });

  it("should generate and stream official Quotation PDF", async () => {
    const res = await request(app)
      .get(`/api/quotes/${createdQuoteId}/pdf`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
  });

  it("should convert approved quote to order", async () => {
    const res = await request(app)
      .post(`/api/quotes/${createdQuoteId}/convert`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quote.status).toBe("converted");
    expect(res.body.data.order).toBeDefined();
    expect(res.body.data.order.pricing.grandTotal).toBe(94400);
  });
});

describe("Phase 3 Commerce: Cart & Wishlist Persistence API", () => {
  it("should add and update item in user persistent cart", async () => {
    const addRes = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId: testProductId, quantity: 3 });

    expect(addRes.status).toBe(200);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.data.items.length).toBeGreaterThan(0);

    const patchRes = await request(app)
      .patch(`/api/cart/items/${testProductId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 5 });

    expect(patchRes.status).toBe(200);
  });

  it("should toggle product in user wishlist", async () => {
    const addRes = await request(app)
      .post("/api/wishlist/toggle")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ productId: testProductId });

    expect(addRes.status).toBe(200);
    expect(addRes.body.success).toBe(true);

    const getRes = await request(app)
      .get("/api/wishlist")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.products.some((p: any) => p._id.toString() === testProductId)).toBe(true);
  });
});
