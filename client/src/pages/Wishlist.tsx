import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { productService } from "@/services/productService";
import Seo from "@/components/Seo";
import { Heart, ShoppingCart, Trash2, ArrowRight, PackageOpen } from "lucide-react";

export default function Wishlist() {
  const { itemIds, removeItem, clear, syncWithServer } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  const { data: allProducts = [], isLoading } = useQuery({
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
        title="My Wishlist — AK Fire Safety Service"
        description="Saved fire safety equipment, extinguishers, and suppression systems for later review."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">My Wishlist</h1>
            <p className="text-xs text-steel mt-0.5">
              {itemIds.length} item(s) saved for upcoming facility inspections or upgrades
            </p>
          </div>
          {itemIds.length > 0 && (
            <button
              onClick={clear}
              className="text-xs text-steel hover:text-red-600 transition-colors"
            >
              Clear Wishlist
            </button>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {wishlistProducts.length === 0 ? (
          <div className="p-16 bg-white border border-black/10 rounded-xl text-center max-w-md mx-auto">
            <PackageOpen className="w-12 h-12 text-steel/50 mx-auto mb-3" />
            <h2 className="font-display font-semibold text-lg text-ink">Your Wishlist is Empty</h2>
            <p className="text-steel text-xs sm:text-sm mt-1">
              Save equipment you are considering for your building, office, or factory.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-dark transition-colors"
            >
              Browse Equipment Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {wishlistProducts.map((p) => {
              const img =
                p.images?.find((i) => i.isPrimary)?.url ||
                p.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80";

              return (
                <div
                  key={p._id}
                  className="bg-white border border-black/10 rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square bg-paper p-4 flex items-center justify-center">
                    <img src={img} alt={p.name} className="w-full h-full object-contain" />
                    <button
                      onClick={() => removeItem(p._id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-steel hover:text-red-600 rounded-full shadow-sm"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand uppercase">{p.brand}</span>
                      <Link
                        to={`/product/${p.slug}`}
                        className="block font-semibold text-sm text-ink hover:text-brand line-clamp-2 mt-0.5"
                      >
                        {p.name}
                      </Link>
                      <span className="text-sm font-bold text-ink block mt-2">
                        ₹{(p.discountPrice || p.price).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(p._id)}
                      disabled={p.stock <= 0}
                      className="mt-4 w-full py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                    </button>
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
