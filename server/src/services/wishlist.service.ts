import { Types } from "mongoose";
import { Wishlist, IWishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

export class WishlistService {
  /**
   * Fetch customer wishlist with populated product details
   */
  async getWishlist(userId: string) {
    let wishlist = await Wishlist.findOne({ user: new Types.ObjectId(userId) }).populate({
      path: "products",
      select: "name slug SKU price discountPrice stock images fireClass capacity unit isFeatured isBestSeller",
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: new Types.ObjectId(userId), products: [] });
    }

    return wishlist;
  }

  /**
   * Toggle product in wishlist
   */
  async toggleWishlist(userId: string, productId: string) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound("Product not found");

    let wishlist = await Wishlist.findOne({ user: new Types.ObjectId(userId) });
    if (!wishlist) {
      wishlist = new Wishlist({ user: new Types.ObjectId(userId), products: [] });
    }

    const exists = wishlist.products.some((id) => id.toString() === productId);
    if (exists) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    } else {
      wishlist.products.push(new Types.ObjectId(productId));
    }

    await wishlist.save();
    return this.getWishlist(userId);
  }

  /**
   * Remove item from wishlist
   */
  async removeItem(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: new Types.ObjectId(userId) });
    if (!wishlist) return null;

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
    return this.getWishlist(userId);
  }

  /**
   * Clear user's entire wishlist
   */
  async clearWishlist(userId: string) {
    await Wishlist.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { products: [] }
    );
    return { success: true };
  }
}

export const wishlistService = new WishlistService();
