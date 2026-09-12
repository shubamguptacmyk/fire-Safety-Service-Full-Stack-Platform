import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, ShieldAlert, Zap, Heart, FileSpreadsheet, Eye } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, lines } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = lines.find((l) => l.productId === product._id);
  const isInCart = Boolean(cartItem);
  const favorited = isInWishlist(product._id);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80";

  const discountPercent =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const currentPrice = product.discountPrice || product.price;

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : "";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem(product._id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product._id);
  }

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-hover hover:border-slate-300 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
      {/* Thumbnail Area */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
        <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23B91C1C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'/></svg>";
            }}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full z-10 transition-colors shadow-2xs ${
            favorited
              ? "bg-red-50 text-primary-700 hover:bg-red-100"
              : "bg-white/90 backdrop-blur-xs text-slate-500 hover:text-primary-700 hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-primary-700 text-primary-700" : ""}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {discountPercent && (
            <span className="bg-primary-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && !discountPercent && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs">
              <Zap className="w-3 h-3" /> BESTSELLER
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center backdrop-blur-2xs">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5 shadow-md">
              <ShieldAlert className="w-3.5 h-3.5" /> Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-slate-700">
              {product.brand || "Industrial"}
            </span>
            {categoryName ? (
              <span className="truncate text-slate-400">{categoryName}</span>
            ) : (
              <span className="truncate text-slate-400 font-mono text-[10px]">{product.SKU}</span>
            )}
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-sm text-dark group-hover:text-primary-700 line-clamp-2 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Fire Classes & Capacity Badges */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {product.capacity && (
              <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                {product.capacity}
              </span>
            )}
            {product.fireClass?.slice(0, 3).map((fc) => (
              <span
                key={fc}
                className="text-[10px] bg-red-50 text-primary-700 font-bold px-1.5 py-0.5 rounded-md border border-red-100"
              >
                Class {fc}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-dark">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
                {product.discountPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">GST extra / billed</p>
            </div>

            <Link
              to={`/request-quote?product=${encodeURIComponent(product.name)}&sku=${encodeURIComponent(product.SKU)}`}
              className="text-[11px] font-semibold text-primary-700 hover:text-primary-800 hover:underline flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Quote</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/product/${product.slug}`}
              className="py-2 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors min-w-0 min-h-[36px]"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Details</span>
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
              className={`py-2 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs min-w-0 min-h-[36px] ${
                product.stock <= 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : justAdded
                  ? "bg-emerald-600 text-white"
                  : isInCart
                  ? "bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-700 hover:text-white"
                  : "bg-primary-700 text-white hover:bg-primary-800"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{isInCart ? "Add More" : "Add to Cart"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
