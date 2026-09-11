import { Types } from "mongoose";
import { Quote, IQuote, QuoteStatus } from "../models/Quote";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Invoice } from "../models/Invoice";
import { AuditLog } from "../models/AuditLog";
import { ApiError } from "../utils/ApiError";
import { CreateQuoteInput, UpdateQuoteStatusInput } from "../validators/quote.validators";

export class QuoteService {
  /**
   * Submit a new B2B quotation request
   */
  async createQuote(input: CreateQuoteInput, userId?: string): Promise<IQuote> {
    const quoteNumber = `AK-QUO-${Date.now().toString().slice(-6)}`;

    // Try to auto-populate product details and pricing if products exist in catalog
    let subtotal = 0;
    const items = await Promise.all(
      input.items.map(async (item) => {
        let unitPrice = 0;
        let sku = item.SKU;
        let name = item.name;

        if (item.productId && Types.ObjectId.isValid(item.productId)) {
          const product = await Product.findById(item.productId);
          if (product) {
            unitPrice = product.discountPrice || product.price;
            sku = product.SKU;
            name = product.name;
          }
        }

        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        return {
          product: item.productId && Types.ObjectId.isValid(item.productId) ? new Types.ObjectId(item.productId) : undefined,
          name,
          SKU: sku,
          quantity: item.quantity,
          unitPrice,
          gstPercent: 18,
          total: lineTotal,
          specifications: item.specifications,
        };
      })
    );

    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    const quote = await Quote.create({
      quoteNumber,
      user: userId ? new Types.ObjectId(userId) : undefined,
      customer: {
        name: input.name,
        companyName: input.companyName,
        phone: input.phone,
        email: input.email,
        gstNumber: input.gstNumber,
        address: input.address,
      },
      items,
      pricing: {
        subtotal,
        gst,
        grandTotal,
      },
      requirements: input.requirements,
      preferredDate: input.preferredDate ? new Date(input.preferredDate) : undefined,
      status: "submitted",
    });

    if (userId) {
      await AuditLog.create({
        userId: new Types.ObjectId(userId),
        action: "quote.create",
        resource: "quotes",
        resourceId: quote._id.toString(),
        details: { quoteNumber, companyName: input.companyName },
      });
    }

    return quote;
  }

  /**
   * List customer's own quotes
   */
  async getMyQuotes(userId: string, email?: string): Promise<IQuote[]> {
    const query: any = {
      $or: [{ user: new Types.ObjectId(userId) }],
    };
    if (email) {
      query.$or.push({ "customer.email": email.toLowerCase() });
    }
    return Quote.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get single quote
   */
  async getQuoteById(idOrNumber: string, userId?: string, isStaff = false): Promise<IQuote> {
    const isObjectId = Types.ObjectId.isValid(idOrNumber);
    const query: any = isObjectId ? { _id: idOrNumber } : { quoteNumber: idOrNumber };

    const quote = await Quote.findOne(query);
    if (!quote) throw ApiError.notFound("Quote not found");

    if (!isStaff && userId && quote.user && quote.user.toString() !== userId) {
      throw ApiError.forbidden("You do not have permission to view this quote.");
    }

    return quote;
  }

  /**
   * Admin: List all quotes with search, status filter, and pagination
   */
  async listQuotes(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.status) filter.status = params.status;
    if (params.search) {
      filter.$or = [
        { quoteNumber: { $regex: params.search, $options: "i" } },
        { "customer.companyName": { $regex: params.search, $options: "i" } },
        { "customer.name": { $regex: params.search, $options: "i" } },
        { "customer.phone": { $regex: params.search, $options: "i" } },
      ];
    }

    const [quotes, total] = await Promise.all([
      Quote.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Quote.countDocuments(filter),
    ]);

    return {
      quotes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Update quote items, custom pricing, admin notes, or status
   */
  async updateQuote(
    quoteId: string,
    input: UpdateQuoteStatusInput,
    staffUserId: string
  ): Promise<IQuote> {
    const quote = await Quote.findById(quoteId);
    if (!quote) throw ApiError.notFound("Quote not found");

    const previousStatus = quote.status;
    quote.status = input.status;

    if (input.adminNotes !== undefined) quote.adminNotes = input.adminNotes;
    if (input.validUntil) quote.validUntil = new Date(input.validUntil);

    if (input.items && input.items.length > 0) {
      quote.items = input.items.map((item) => ({
        product: item.productId && Types.ObjectId.isValid(item.productId) ? new Types.ObjectId(item.productId) : undefined,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstPercent: item.gstPercent || 18,
        total: item.total || item.unitPrice * item.quantity,
        specifications: item.specifications,
      }));
    }

    if (input.pricing) {
      quote.pricing = input.pricing;
    } else if (input.items) {
      const subtotal = quote.items.reduce((s, it) => s + it.total, 0);
      const gst = Math.round(subtotal * 0.18);
      quote.pricing = { subtotal, gst, grandTotal: subtotal + gst };
    }

    await quote.save();

    await AuditLog.create({
      userId: new Types.ObjectId(staffUserId),
      action: "quote.update",
      resource: "quotes",
      resourceId: quote._id.toString(),
      details: { previousStatus, newStatus: input.status, quoteNumber: quote.quoteNumber },
    });

    return quote;
  }

  /**
   * Convert an approved B2B Quote directly into an Order
   */
  async convertQuoteToOrder(quoteId: string, staffUserId: string): Promise<{ quote: IQuote; order: any }> {
    const quote = await Quote.findById(quoteId);
    if (!quote) throw ApiError.notFound("Quote not found");

    if (quote.status === "converted" && quote.convertedOrderId) {
      throw ApiError.badRequest("This quotation has already been converted to an order.");
    }

    const orderNumber = `AK-ORD-${Date.now().toString().slice(-6)}`;
    const orderItems: any[] = quote.items.map((item) => ({
      product: item.product || new Types.ObjectId(),
      name: item.name,
      SKU: item.SKU || "B2B-CUSTOM",
      price: item.unitPrice,
      quantity: item.quantity,
      capacity: item.specifications,
      hsnSac: "84241000",
    }));

    const order = await Order.create({
      orderNumber,
      user: quote.user,
      customer: {
        name: quote.customer.name,
        companyName: quote.customer.companyName,
        email: quote.customer.email,
        phone: quote.customer.phone,
        gstNumber: quote.customer.gstNumber,
      },
      items: orderItems,
      shippingAddress: quote.customer.address || {
        line1: "Client Premises",
        city: "Navi Mumbai",
        state: "Maharashtra",
        pincode: "400705",
      },
      pricing: {
        subtotal: quote.pricing.subtotal,
        discount: 0,
        gst: quote.pricing.gst,
        shippingFee: 0,
        grandTotal: quote.pricing.grandTotal,
      },
      deliveryMethod: "standard",
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "Confirmed",
      statusHistory: [
        {
          status: "Confirmed",
          changedAt: new Date(),
          note: `Generated from converted quotation ${quote.quoteNumber}`,
        },
      ],
      notes: `Converted from quotation ${quote.quoteNumber}. Requirements: ${quote.requirements}`,
    });

    quote.status = "converted";
    quote.convertedOrderId = order._id;
    await quote.save();

    await AuditLog.create({
      userId: new Types.ObjectId(staffUserId),
      action: "quote.convert_to_order",
      resource: "quotes",
      resourceId: quote._id.toString(),
      details: { quoteNumber: quote.quoteNumber, orderNumber: order.orderNumber },
    });

    return { quote, order };
  }

  /**
   * Customer: Cancel quote request
   */
  async cancelQuote(quoteId: string, userId: string, reason?: string): Promise<IQuote> {
    const quote = await Quote.findById(quoteId);
    if (!quote) throw ApiError.notFound("Quote not found");

    if (quote.user && quote.user.toString() !== userId) {
      throw ApiError.forbidden("You do not have permission to cancel this quotation.");
    }

    if (quote.status === "converted") {
      throw ApiError.badRequest("Cannot cancel a quote that has already been converted to an order.");
    }

    quote.status = "cancelled";
    await quote.save();
    return quote;
  }
}

export const quoteService = new QuoteService();
