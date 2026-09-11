import { Types } from "mongoose";
import { Cart, ICart } from "../models/Cart";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

export class CartService {
  /**
   * Fetch customer cart with populated product details
   */
  async getCart(userId: string) {
    let cart = await Cart.findOne({ user: new Types.ObjectId(userId) }).populate({
      path: "items.product",
      select: "name SKU price discountPrice stock images unit minimumOrderQuantity fireClass capacity isActive",
    });

    if (!cart) {
      cart = await Cart.create({ user: new Types.ObjectId(userId), items: [] });
    }

    const cartObj = cart.toObject ? cart.toObject() : cart;
    let subtotal = 0;
    let unavailableCount = 0;
    let totalItems = 0;

    const enrichedItems = (cartObj.items || []).map((item: any) => {
      const prod = item.product;
      const isAvailable = Boolean(prod && prod.isActive && prod.stock > 0);
      const inStock = Boolean(prod && prod.stock >= item.quantity);
      if (!isAvailable) unavailableCount++;

      const price = prod
        ? prod.discountPrice && prod.discountPrice > 0
          ? prod.discountPrice
          : prod.price || 0
        : 0;

      const lineTotal = isAvailable ? price * item.quantity : 0;
      if (isAvailable) {
        subtotal += lineTotal;
        totalItems += item.quantity;
      }

      return {
        ...item,
        unitPrice: price,
        lineTotal,
        isAvailable,
        inStock,
        availableStock: prod?.stock ?? 0,
      };
    });

    const gst = Math.round(subtotal * 0.18);
    const shippingFee = subtotal === 0 || subtotal >= 5000 ? 0 : 250;
    const totalAmount = subtotal + gst + shippingFee;

    return {
      _id: cartObj._id,
      user: cartObj.user,
      items: enrichedItems,
      totalItems,
      subtotal,
      gst,
      taxAmount: gst,
      shippingFee,
      totalAmount,
      grandTotal: totalAmount,
      pricing: {
        subtotal,
        gst,
        shippingFee,
        totalAmount,
      },
      hasUnavailableItems: unavailableCount > 0,
      createdAt: cartObj.createdAt,
      updatedAt: cartObj.updatedAt,
    };
  }

  /**
   * Add or update an item in cart
   */
  async addItem(userId: string, productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw ApiError.badRequest("Product is unavailable");
    }

    let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) {
      cart = new Cart({ user: new Types.ObjectId(userId), items: [] });
    }

    const existingIdx = cart.items.findIndex((item) => item.product.toString() === productId);
    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > product.stock) {
        throw ApiError.badRequest(`Only ${product.stock} units available in stock`);
      }
      cart.items[existingIdx].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        throw ApiError.badRequest(`Only ${product.stock} units available in stock`);
      }
      cart.items.push({
        product: new Types.ObjectId(productId),
        quantity,
        addedAt: new Date(),
      });
    }

    await cart.save();
    return this.getCart(userId);
  }

  /**
   * Update line quantity
   */
  async updateQuantity(userId: string, productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound("Product not found");

    if (quantity > product.stock) {
      throw ApiError.badRequest(`Cannot exceed stock limit (${product.stock} available)`);
    }

    const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) throw ApiError.notFound("Cart not found");

    if (quantity <= 0) {
      cart.items = cart.items.filter((it) => it.product.toString() !== productId);
    } else {
      const line = cart.items.find((it) => it.product.toString() === productId);
      if (line) {
        line.quantity = quantity;
      }
    }

    await cart.save();
    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, productId: string) {
    const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) return null;

    cart.items = cart.items.filter((it) => it.product.toString() !== productId);
    await cart.save();
    return this.getCart(userId);
  }

  /**
   * Clear user's cart
   */
  async clearCart(userId: string) {
    await Cart.findOneAndUpdate({ user: new Types.ObjectId(userId) }, { items: [] });
    return { success: true };
  }

  /**
   * Merge guest localStorage cart items on login
   */
  async syncCart(userId: string, guestItems: { productId: string; quantity: number }[]) {
    let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
    if (!cart) {
      cart = new Cart({ user: new Types.ObjectId(userId), items: [] });
    }

    for (const gItem of guestItems) {
      const product = await Product.findById(gItem.productId);
      if (!product || !product.isActive) continue;

      const idx = cart.items.findIndex((it) => it.product.toString() === gItem.productId);
      if (idx > -1) {
        cart.items[idx].quantity = Math.min(product.stock, cart.items[idx].quantity + gItem.quantity);
      } else {
        cart.items.push({
          product: new Types.ObjectId(gItem.productId),
          quantity: Math.min(product.stock, gItem.quantity),
          addedAt: new Date(),
        });
      }
    }

    await cart.save();
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
