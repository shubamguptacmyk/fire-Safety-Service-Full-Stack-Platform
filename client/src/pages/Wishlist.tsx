import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { productService } from "@/services/productService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { Heart, ShoppingCart, Trash2, ArrowRight, FileSpreadsheet } from "lucide-react";

export default function Wishlist() {
  const { itemIds, removeItem, clear, syncWithServer } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  const { data: allProducts = [] } = useQuery({
    queryKey: ["wishlist-products", itemIds.join(",")],
    queryFn: async () => {
      if (itemIds.length === 0) return [];
      const res = await productService.getProducts({ limit: 100 });
      return res.products;
    },
  });

  const wishlistProducts = allProducts.filter((p) => itemIds.includes(p._id));

  function handleMoveToCart(productId: string) {
    addItem(productId, 1);
    removeItem(productId);
  }

  return (
    <>
      <Seo
        title="Saved Equipment &amp; Wishlist — Shubam Fire Protection"
        description="Review saved fire safety equipment, extinguishers, and suppression systems saved for your facility."
      />

      <div className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: "Saved Equipment" }]} />
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-dark">
              Saved Equipment &amp; Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {itemIds.length} item(s) saved for upcoming facility inspections, procurement, or upgrades
            </p>
          </div>
          {itemIds.length > 0 && (
            <button
              onClick={clear}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {wishlistProducts.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-10 h-10 text-slate-400" />}
            title="Your Wishlist is Empty"
            description="You haven't saved any fire protection gear yet. Browse our catalog to bookmark equipment for your facility."
            action={
              <Link to="/products">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Equipment Catalog
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((p) => {
              const img =
                p.images?.find((i) => i.isPrimary)?.url ||
                p.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80";

              return (
                <div
                  key={p._id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-card hover:shadow-hover hover:border-slate-300 transition-all group"
                >
                  <div className="relative aspect-square bg-slate-50 p-6 flex items-center justify-center border-b border-slate-100">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeItem(p._id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-400 hover:text-red-600 rounded-full shadow-2xs transition-colors"
                      aria-label="Remove from wishlist"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">
                        {p.brand} &bull; SKU: {p.SKU}
                      </span>
                      <Link
                        to={`/product/${p.slug}`}
                        className="block font-bold text-sm text-dark hover:text-primary-700 line-clamp-2 mt-1 transition-colors leading-snug"
                      >
                        {p.name}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-2.5">
                        <span className="text-base font-extrabold text-dark font-display">
                          ₹{(p.discountPrice || p.price).toLocaleString("en-IN")}
                        </span>
                        {p.discountPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <Link
                        to={`/request-quote?product=${encodeURIComponent(p.name)}&sku=${encodeURIComponent(p.SKU)}`}
                        className="py-2 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-primary-700" />
                        <span>Quote</span>
                      </Link>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMoveToCart(p._id)}
                        disabled={p.stock <= 0}
                        leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                      >
                        {p.stock <= 0 ? "Out of Stock" : "Move to Cart"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
