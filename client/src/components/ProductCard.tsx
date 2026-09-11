import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, ShieldAlert, Zap, Heart } from "lucide-react";
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
    <div className="group bg-white rounded-lg border border-black/10 overflow-hidden hover:shadow-lg hover:border-brand/40 transition-all duration-200 flex flex-col h-full relative">
      <div className="relative aspect-square overflow-hidden bg-paper flex items-center justify-center p-4">
        <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23C13B26' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'/></svg>";
            }}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <button
          onClick={handleToggleWishlist}
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-colors shadow-sm ${
            favorited
              ? "bg-red-50 text-brand hover:bg-red-100"
              : "bg-white/80 text-steel hover:text-brand hover:bg-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-brand" : ""}`} />
        </button>
        {discountPercent && (
          <span className="absolute top-2 left-2 bg-brand text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && !discountPercent && (
          <span className="absolute top-2 left-2 bg-amber text-ink text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Zap className="w-3 h-3" /> BESTSELLER
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-steel mb-1">
            <span className="font-semibold uppercase tracking-wider text-ink/70">{product.brand}</span>
            <span className="truncate">{product.SKU}</span>
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-sm text-ink group-hover:text-brand line-clamp-2 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Fire Classes & Capacity Pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {product.capacity && (
              <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.5 rounded">
                {product.capacity}
              </span>
            )}
            {product.fireClass?.slice(0, 3).map((fc) => (
              <span
                key={fc}
                className="text-[10px] bg-red-50 text-brand font-semibold px-1.5 py-0.5 rounded border border-red-100"
              >
                {fc}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-ink">₹{currentPrice.toLocaleString("en-IN")}</span>
              {product.discountPrice && (
                <span className="text-xs text-steel line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="text-[10px] text-steel">GST extra / inclusive</p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            aria-label={`Add ${product.name} to cart`}
            className={`p-2 rounded font-medium text-xs flex items-center gap-1.5 transition-colors ${
              product.stock <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : justAdded
                ? "bg-green-600 text-white"
                : isInCart
                ? "bg-brand/10 text-brand hover:bg-brand hover:text-white"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isInCart ? "Add More" : "Add"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
