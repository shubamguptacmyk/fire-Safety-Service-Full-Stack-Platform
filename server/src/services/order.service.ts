import { Types } from "mongoose";
import { Order, IOrder, OrderStatus } from "../models/Order";
import { Product } from "../models/Product";
import { Payment } from "../models/Payment";
import { Invoice } from "../models/Invoice";
import { AuditLog } from "../models/AuditLog";
import { Cart } from "../models/Cart";
import { CouponService } from "./coupon.service";
import { ApiError } from "../utils/ApiError";
import { CreateOrderInput, UpdateOrderStatusInput } from "../validators/order.validators";

export class OrderService {
  /**
   * Place an order with real stock validation, atomic stock decrement, GST and Invoice generation
   */
  async createOrder(input: CreateOrderInput, userId?: string): Promise<{ order: IOrder; invoice?: any; payment: any }> {
    // If items not provided or empty, load from user's active cart
    let itemsToProcess = input.items || [];
    if (itemsToProcess.length === 0 && userId) {
      const userCart = await Cart.findOne({ user: new Types.ObjectId(userId) });
      if (!userCart || userCart.items.length === 0) {
        throw ApiError.badRequest("Cart is empty. Please add items before placing order.");
      }
      itemsToProcess = userCart.items.map((i) => ({
        productId: i.product.toString(),
        quantity: i.quantity,
      }));
    }

    if (itemsToProcess.length === 0) {
      throw ApiError.badRequest("At least one item is required in the order.");
    }

    const productIds = itemsToProcess.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    if (products.length !== itemsToProcess.length) {
      throw ApiError.badRequest("One or more requested products are unavailable or discontinued.");
    }

    // Validate stock and minimum order quantities before locking
    for (const item of itemsToProcess) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) continue;

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`
        );
      }

      if (product.minimumOrderQuantity && item.quantity < product.minimumOrderQuantity) {
        throw ApiError.badRequest(
          `Minimum order quantity for "${product.name}" is ${product.minimumOrderQuantity}.`
        );
      }
    }

    // Build order items & calculate pricing
    let subtotal = 0;
    const orderItems: any[] = [];
    const decrementedProducts: { id: Types.ObjectId; qty: number }[] = [];

    try {
      for (const item of itemsToProcess) {
        const product = products.find((p) => p._id.toString() === item.productId)!;
        const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
        const lineTotal = effectivePrice * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          SKU: product.SKU,
          price: effectivePrice,
          quantity: item.quantity,
          image: product.images?.[0]?.url,
          capacity: product.capacity,
          fireClass: product.fireClass,
          hsnSac: "84241000",
        });

        // Safe atomic stock decrement checking stock >= quantity
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: item.quantity }, isActive: true },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!updated) {
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}". Another customer may have just ordered it.`
          );
        }

        decrementedProducts.push({ id: product._id, qty: item.quantity });
      }
    } catch (err) {
      // Rollback any already decremented stock if an error happens during loop
      for (const d of decrementedProducts) {
        await Product.findByIdAndUpdate(d.id, { $inc: { stock: d.qty } });
      }
      throw err;
    }

    // Validate and apply coupon if provided
    let discount = 0;
    let validatedCoupon: any = null;
    if (input.couponCode) {
      const couponResult = await CouponService.validateCoupon(
        { code: input.couponCode, orderAmount: subtotal },
        userId
      );
      discount = couponResult.discountAmount;
      validatedCoupon = couponResult;
    }

    const taxableSubtotal = Math.max(0, subtotal - discount);
    const gst = Math.round(taxableSubtotal * 0.18);
    let shippingFee = 0;
    if (input.deliveryMethod === "pickup") {
      shippingFee = 0;
    } else if (input.deliveryMethod === "express") {
      shippingFee = 450;
    } else {
      shippingFee = taxableSubtotal >= 5000 ? 0 : 250;
    }

    const grandTotal = taxableSubtotal + gst + shippingFee;
    const orderNumber = `AK-ORD-${Date.now().toString().slice(-6)}`;
    const isMockOrPaid = input.paymentMethod === "mock";
    const initialStatus: OrderStatus = isMockOrPaid ? "Confirmed" : "Pending";
    const initialPaymentStatus = isMockOrPaid ? "paid" : "pending";

    const order = await Order.create({
      orderNumber,
      user: userId ? new Types.ObjectId(userId) : undefined,
      customer: {
        name: input.customer.name,
        email: input.customer.email || undefined,
        phone: input.customer.phone,
        companyName: input.customer.companyName,
        gstNumber: input.customer.gstNumber,
      },
      items: orderItems,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress || input.shippingAddress,
      pricing: {
        subtotal,
        discount,
        couponCode: input.couponCode ? input.couponCode.trim().toUpperCase() : undefined,
        gst,
        shippingFee,
        grandTotal,
      },
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      paymentStatus: initialPaymentStatus,
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          changedAt: new Date(),
          note: isMockOrPaid ? "Order placed & confirmed via instant mock payment" : "Order placed",
        },
      ],
      notes: input.notes,
    });

    // Record coupon usage if valid coupon applied
    if (validatedCoupon && validatedCoupon.couponId) {
      await CouponService.recordUsage(
        validatedCoupon.couponId,
        userId || order._id,
        order._id,
        discount
      );
    }

    // Automatically clear customer's cart after order placement
    if (userId) {
      await Cart.findOneAndUpdate({ user: new Types.ObjectId(userId) }, { items: [] });
    }

    // Create Payment record
    const payment = await Payment.create({
      paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
      orderId: order._id,
      user: userId ? new Types.ObjectId(userId) : undefined,
      amount: grandTotal,
      currency: "INR",
      method: input.paymentMethod,
      status: initialPaymentStatus === "paid" ? "success" : "pending",
      transactionId: `TXN-${Date.now()}`,
    });

    // Generate GST Tax Invoice immediately if confirmed/paid or COD
    let invoice: any = null;
    try {
      const taxableAmount = subtotal;
      const isInterState = input.shippingAddress.state && !input.shippingAddress.state.toLowerCase().includes("maharashtra");
      const cgst = isInterState ? 0 : Math.round(gst / 2);
      const sgst = isInterState ? 0 : Math.round(gst / 2);
      const igst = isInterState ? gst : 0;

      invoice = await Invoice.create({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        orderId: order._id,
        user: userId ? new Types.ObjectId(userId) : undefined,
        invoiceDate: new Date(),
        customer: {
          name: input.customer.name,
          companyName: input.customer.companyName,
          gstin: input.customer.gstNumber,
          phone: input.customer.phone,
          email: input.customer.email,
          address: input.shippingAddress,
        },
        items: orderItems.map((item) => ({
          name: item.name,
          hsnSac: item.hsnSac || "84241000",
          quantity: item.quantity,
          unitPrice: item.price,
          taxableAmount: item.price * item.quantity,
          taxRate: 18,
          cgstAmount: isInterState ? 0 : Math.round((item.price * item.quantity * 0.09)),
          sgstAmount: isInterState ? 0 : Math.round((item.price * item.quantity * 0.09)),
          igstAmount: isInterState ? Math.round((item.price * item.quantity * 0.18)) : 0,
          totalAmount: Math.round(item.price * item.quantity * 1.18),
        })),
        totals: {
          taxableAmount,
          cgstTotal: cgst,
          sgstTotal: sgst,
          igstTotal: igst,
          grandTotal,
          roundOff: 0,
        },
        paymentStatus: initialPaymentStatus === "paid" ? "paid" : "unpaid",
      });
    } catch (invErr) {
      // Logging invoice creation failure without blocking the order
      console.error("Auto invoice creation failed:", invErr);
    }

    if (userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(userId),
        action: "order.create",
        resource: "orders",
        resourceId: order._id.toString(),
        details: { orderNumber, grandTotal, paymentMethod: input.paymentMethod },
      });
    }

    return { order, invoice, payment };
  }

  /**
   * Get orders for the authenticated customer
   */
  async getMyOrders(userId: string, phone?: string): Promise<IOrder[]> {
    const query: any = {
      $or: [{ user: new Types.ObjectId(userId) }],
    };
    if (phone) {
      query.$or.push({ "customer.phone": phone });
    }
    return Order.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get single order details with ownership verification
   */
  async getOrderById(idOrNumber: string, userId?: string, isStaff = false): Promise<IOrder> {
    const isObjectId = Types.ObjectId.isValid(idOrNumber);
    const query: any = isObjectId ? { _id: idOrNumber } : { orderNumber: idOrNumber };

    const order = await Order.findOne(query);
    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    if (!isStaff && userId && order.user && order.user.toString() !== userId) {
      throw ApiError.forbidden("You do not have access to view this order.");
    }

    return order;
  }

  /**
   * Admin: List orders with search, status filters, and pagination
   */
  async listOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.status) filter.status = params.status;
    if (params.paymentStatus) filter.paymentStatus = params.paymentStatus;
    if (params.search) {
      filter.$or = [
        { orderNumber: { $regex: params.search, $options: "i" } },
        { "customer.name": { $regex: params.search, $options: "i" } },
        { "customer.companyName": { $regex: params.search, $options: "i" } },
        { "customer.phone": { $regex: params.search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Update order status & delivery details
   */
  async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput,
    staffUserId: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    const previousStatus = order.status;
    order.status = input.status;

    if (input.deliveryDetails) {
      order.deliveryDetails = {
        ...order.deliveryDetails,
        carrier: input.deliveryDetails.carrier || order.deliveryDetails?.carrier,
        lrNumber: input.deliveryDetails.lrNumber || order.deliveryDetails?.lrNumber,
        estimatedDelivery: input.deliveryDetails.estimatedDelivery
          ? new Date(input.deliveryDetails.estimatedDelivery)
          : order.deliveryDetails?.estimatedDelivery,
      };
      if (input.status === "Dispatched") {
        order.deliveryDetails.dispatchedAt = new Date();
      } else if (input.status === "Delivered") {
        order.deliveryDetails.deliveredAt = new Date();
        order.paymentStatus = "paid";
      }
    }

    order.statusHistory.push({
      status: input.status,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(staffUserId),
      note: input.note || `Status updated from ${previousStatus} to ${input.status}`,
    });

    // Restock items if order cancelled or refunded
    if ((input.status === "Cancelled" || input.status === "Refunded") && previousStatus !== "Cancelled" && previousStatus !== "Refunded") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
      order.cancelledAt = new Date();
      order.cancellationReason = input.note || "Cancelled by administrator";
    }

    await order.save();

    await AuditLog.create({
      userId: new Types.ObjectId(staffUserId),
      action: "order.update_status",
      resource: "orders",
      resourceId: order._id.toString(),
      details: { previousStatus, newStatus: input.status, orderNumber: order.orderNumber },
    });

    return order;
  }

  /**
   * Admin: Update payment status manually
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: "pending" | "paid" | "failed" | "refunded",
    staffUserId: string,
    note?: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    const previousStatus = order.paymentStatus;
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "paid") {
      order.paymentDetails = {
        ...order.paymentDetails,
        paidAt: order.paymentDetails?.paidAt || new Date(),
      };
    }

    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(staffUserId),
      note: note || `Payment status updated from ${previousStatus} to ${paymentStatus}`,
    });

    await order.save();

    await AuditLog.create({
      userId: new Types.ObjectId(staffUserId),
      action: "order.update_payment_status",
      resource: "orders",
      resourceId: order._id.toString(),
      details: { previousStatus, newStatus: paymentStatus, orderNumber: order.orderNumber, note },
    });

    return order;
  }

  /**
   * Customer: Cancel an eligible order
   */
  async cancelOrder(orderId: string, userId: string, reason: string): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound("Order not found");

    if (order.user && order.user.toString() !== userId) {
      throw ApiError.forbidden("You cannot cancel someone else's order.");
    }

    if (!["Pending", "Confirmed"].includes(order.status)) {
      throw ApiError.badRequest(`Order cannot be cancelled because it is already ${order.status}.`);
    }

    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: "Cancelled",
      changedAt: new Date(),
      changedBy: new Types.ObjectId(userId),
      note: `Cancelled by customer: ${reason}`,
    });

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    await order.save();

    await AuditLog.create({
      userId: new Types.ObjectId(userId),
      action: "order.cancel",
      resource: "orders",
      resourceId: order._id.toString(),
      details: { reason, orderNumber: order.orderNumber },
    });

    return order;
  }
}

export const orderService = new OrderService();
