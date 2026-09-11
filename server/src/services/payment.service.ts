import crypto from "crypto";
import { Order } from "../models/Order";
import { Payment, IPayment } from "../models/Payment";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { NotificationService } from "./notification.service";
import { EmailService } from "./email.service";
import { Types } from "mongoose";

export class PaymentService {
  /**
   * Initiate payment for an existing order
   */
  static async createPayment(
    orderId: string,
    method: "mock" | "cod" | "razorpay" = "mock",
    userId?: string
  ): Promise<any> {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    if (order.paymentStatus === "paid") {
      throw ApiError.badRequest("Order is already paid");
    }

    if (userId && order.user && order.user.toString() !== userId) {
      throw ApiError.forbidden("You do not have permission to pay for this order");
    }

    const amount = order.pricing.grandTotal;
    let payment = await Payment.findOne({ orderId: order._id });

    if (method === "mock") {
      const transactionId = `MOCK-TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      if (payment) {
        payment.amount = amount;
        payment.method = "mock";
        payment.status = "success";
        payment.transactionId = transactionId;
        payment.gatewayResponse = { paidAt: new Date() };
        await payment.save();
      } else {
        payment = await Payment.create({
          paymentNumber: `PAY-${Date.now()}`,
          orderId: order._id,
          user: order.user,
          amount,
          currency: "INR",
          method: "mock",
          status: "success",
          transactionId,
          gatewayResponse: { paidAt: new Date() },
        });
      }

      order.paymentStatus = "paid";
      order.paymentMethod = "mock";
      order.paymentDetails = {
        transactionId,
        paidAt: new Date(),
      };
      if (order.status === "Pending") {
        order.status = "Confirmed";
        order.statusHistory.push({
          status: "Confirmed",
          changedAt: new Date(),
          note: `Payment completed via Mock mode (${transactionId})`,
        });
      }
      await order.save();

      if (order.user) {
        await NotificationService.sendInApp(
          order.user,
          "Payment Received",
          `Payment of ₹${amount.toLocaleString("en-IN")} for order ${order.orderNumber} was successful.`,
          "order",
          `/orders/${order._id}`
        );
      }

      if (order.customer.email) {
        await EmailService.sendOrderConfirmation(order.customer.email, order.orderNumber, amount);
      }

      return {
        paymentId: payment._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        method: "mock",
        status: "paid",
        transactionId,
        amount,
      };
    }

    if (method === "cod") {
      if (payment) {
        payment.amount = amount;
        payment.method = "cod";
        payment.status = "pending";
        payment.transactionId = `COD-${order.orderNumber}`;
        await payment.save();
      } else {
        payment = await Payment.create({
          paymentNumber: `PAY-${Date.now()}`,
          orderId: order._id,
          user: order.user,
          amount,
          currency: "INR",
          method: "cod",
          status: "pending",
          transactionId: `COD-${order.orderNumber}`,
        });
      }

      order.paymentStatus = "pending";
      order.paymentMethod = "cod";
      order.paymentDetails = {
        transactionId: `COD-${order.orderNumber}`,
      };
      if (order.status === "Pending") {
        order.status = "Confirmed";
        order.statusHistory.push({
          status: "Confirmed",
          changedAt: new Date(),
          note: "Order confirmed with Cash on Delivery",
        });
      }
      await order.save();

      return {
        paymentId: payment._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        method: "cod",
        status: "pending",
        amount,
      };
    }

    if (method === "razorpay") {
      if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        // Fallback to mock with informative message
        return this.createPayment(orderId, "mock", userId);
      }

      const razorpayOrderId = `order_${Date.now().toString().slice(-14)}`;
      if (payment) {
        payment.amount = amount;
        payment.method = "razorpay";
        payment.status = "pending";
        payment.razorpayOrderId = razorpayOrderId;
        await payment.save();
      } else {
        payment = await Payment.create({
          paymentNumber: `PAY-${Date.now()}`,
          orderId: order._id,
          user: order.user,
          amount,
          currency: "INR",
          method: "razorpay",
          status: "pending",
          razorpayOrderId,
        });
      }

      return {
        paymentId: payment._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        method: "razorpay",
        status: "pending",
        gatewayOrderId: razorpayOrderId,
        key: env.RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // in paise
        currency: "INR",
      };
    }

    throw ApiError.badRequest("Unsupported payment method");
  }

  /**
   * Verify razorpay payment signature or mock verification
   */
  static async verifyPayment(
    orderId: string,
    verification: {
      paymentId?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    }
  ) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    if (order.paymentStatus === "paid") {
      return { success: true, orderId: order._id, status: "paid" };
    }

    if (verification.razorpaySignature && env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(`${verification.razorpayOrderId}|${verification.razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== verification.razorpaySignature) {
        throw ApiError.badRequest("Invalid Razorpay payment signature");
      }
    }

    const transactionId = verification.razorpayPaymentId || `TXN-${Date.now()}`;
    order.paymentStatus = "paid";
    order.paymentDetails = {
      transactionId,
      paidAt: new Date(),
      gatewayOrderId: verification.razorpayOrderId,
    };
    if (order.status === "Pending") order.status = "Confirmed";
    await order.save();

    await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        status: "success",
        transactionId,
        razorpayPaymentId: verification.razorpayPaymentId,
        razorpaySignature: verification.razorpaySignature,
        gatewayResponse: verification,
      }
    );

    return { success: true, orderId: order._id, status: "paid" };
  }

  /**
   * Get single payment record
   */
  static async getPaymentById(id: string, userId?: string, isStaff = false) {
    const payment = await Payment.findById(id).populate("orderId", "orderNumber pricing customer status");
    if (!payment) throw ApiError.notFound("Payment record not found");

    if (!isStaff && userId && payment.user && payment.user.toString() !== userId) {
      throw ApiError.forbidden("Access denied");
    }

    return payment;
  }

  /**
   * Handle Razorpay Webhook notifications
   */
  static async handleWebhook(payload: any, signature?: string, rawBody?: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;
    if (signature && secret && rawBody) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      if (expectedSignature !== signature) {
        throw ApiError.badRequest("Invalid webhook signature");
      }
    }

    const event = payload?.event;
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      const transactionId = paymentEntity?.id;

      if (gatewayOrderId) {
        const payment = await Payment.findOne({
          $or: [{ razorpayOrderId: gatewayOrderId }, { transactionId: gatewayOrderId }],
        });
        if (payment && payment.orderId) {
          await this.verifyPayment(payment.orderId.toString(), {
            razorpayOrderId: gatewayOrderId,
            razorpayPaymentId: transactionId,
          });
        }
      }
    }

    return { received: true };
  }

  /**
   * List payments with filtering and pagination for Admin / Staff
   */
  static async listPayments(params: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.status && params.status !== "all") {
      filter.status = params.status;
    }
    if (params.method && params.method !== "all") {
      filter.method = params.method;
    }
    if (params.search) {
      filter.$or = [
        { paymentNumber: { $regex: params.search, $options: "i" } },
        { transactionId: { $regex: params.search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Payment.find(filter)
        .populate("orderId", "orderNumber customer pricing status")
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Update payment status (e.g. refunded, failed, success)
   */
  static async updatePaymentStatus(
    id: string,
    status: "pending" | "success" | "failed" | "refunded"
  ) {
    const payment = await Payment.findById(id);
    if (!payment) throw ApiError.notFound("Payment not found");

    payment.status = status;
    await payment.save();

    if (payment.orderId) {
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus =
          status === "success" ? "paid" : status === "refunded" ? "refunded" : "pending";
        await order.save();
      }
    }

    return payment;
  }
}
