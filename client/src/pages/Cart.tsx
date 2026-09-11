import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import Seo from "@/components/Seo";
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  FileSpreadsheet,
  Tag,
  Check,
  AlertCircle,
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { lines, updateQuantity, removeItem, clear, quoteMode, setQuoteMode } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Fetch product details for all IDs currently in cart
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["cart-products-fetch", lines.map((l) => l.productId).sort().join(",")],
    queryFn: async () => {
      if (lines.length === 0) return [];
      const res = await productService.getProducts({ limit: 100 });
      return res.products;
    },
  });

  const cartProducts = lines
    .map((line) => {
      const product = allProducts.find((p) => p._id === line.productId);
      return product ? { ...product, quantity: line.quantity } : null;
    })
    .filter(Boolean) as (Product & { quantity: number })[];

  // Price calculations
  const subtotal = cartProducts.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const couponDiscount = appliedCoupon ? Math.round((subtotal * appliedCoupon.percent) / 100) : 0;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const gst = Math.round(taxableAmount * 0.18);
  const shipping = taxableAmount > 5000 || taxableAmount === 0 ? 0 : 250;
  const grandTotal = taxableAmount + gst + shipping;

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponError("");
    const clean = couponCode.trim().toUpperCase();
    if (clean === "SAFETY10") {
      setAppliedCoupon({ code: "SAFETY10", percent: 10 });
    } else if (clean === "FIRSTFIRE") {
      setAppliedCoupon({ code: "FIRSTFIRE", percent: 15 });
    } else {
      setCouponError("Invalid coupon code. Try SAFETY10 or FIRSTFIRE.");
    }
  }

  function handleProceed() {
    if (quoteMode) {
      navigate("/quotes/new");
    } else {
      navigate("/checkout");
    }
  }

  return (
    <>
      <Seo
        title="Shopping Cart & B2B Quote Tray — AK Fire Safety Service"
        description="Review selected fire safety equipment, apply coupons, review GST tax breakdown, or convert to a B2B quotation request."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              {quoteMode ? "B2B Quotation Tray" : "Shopping Cart"}
            </h1>
            <p className="text-xs sm:text-sm text-steel mt-0.5">
              {quoteMode
                ? "Review items for formal B2B pricing proposal with GST tax credits"
                : "Review your equipment selection and calculate delivery & GST"}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-white border border-black/10 p-1 rounded-lg flex items-center shadow-sm">
            <button
              onClick={() => setQuoteMode(false)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                !quoteMode ? "bg-brand text-white shadow-sm" : "text-steel hover:text-ink"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Direct Purchase
            </button>
            <button
              onClick={() => setQuoteMode(true)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                quoteMode ? "bg-ink text-white shadow-sm" : "text-steel hover:text-ink"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber" /> Request B2B Quote
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {lines.length === 0 ? (
          <div className="p-16 bg-white border border-black/10 rounded-xl text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-paper rounded-full flex items-center justify-center mx-auto mb-4 text-steel">
              <ShoppingBag className="w-8 h-8 text-brand" />
            </div>
            <h2 className="font-display text-xl font-bold text-ink">Your Tray is Empty</h2>
            <p className="text-steel text-xs sm:text-sm mt-1.5 max-w-xs mx-auto">
              You haven&apos;t added any fire extinguishers or safety gear yet.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
            >
              Explore Equipment Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Col: Cart Line Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-black/10 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-black/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-steel bg-paper">
                  <span>Product Details</span>
                  <button
                    onClick={clear}
                    className="text-steel hover:text-red-600 transition-colors normal-case font-medium text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                </div>

                <div className="divide-y divide-black/5">
                  {cartProducts.map((item) => {
                    const img =
                      item.images?.find((i) => i.isPrimary)?.url ||
                      item.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=120&q=80";
                    const itemPrice = item.discountPrice || item.price;
                    const lineTotal = itemPrice * item.quantity;

                    return (
                      <div
                        key={item._id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-paper/30 transition-colors"
                      >
                        <img
                          src={img}
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded bg-paper border border-black/10 p-1 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                            {item.brand} · SKU: {item.SKU}
                          </span>
                          <Link
                            to={`/product/${item.slug}`}
                            className="block text-sm font-semibold text-ink hover:text-brand transition-colors truncate"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-steel mt-0.5">
                            {item.capacity && <span>Capacity: {item.capacity}</span>}
                            {item.fireClass?.length > 0 && (
                              <span>• {item.fireClass.slice(0, 2).join(", ")}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                          <div className="flex items-center border border-black/20 rounded bg-white">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="p-1.5 hover:bg-paper text-ink"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1.5 hover:bg-paper text-ink disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right min-w-[90px]">
                            <span className="text-sm font-bold text-ink">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </span>
                            <span className="block text-[10px] text-steel">
                              ₹{itemPrice.toLocaleString("en-IN")} each
                            </span>
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-1 text-steel hover:text-red-600 rounded"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* B2B Quotation Notice */}
              {quoteMode && (
                <div className="p-4 bg-amber/10 border border-amber/30 rounded-xl flex items-start gap-3 text-ink">
                  <FileSpreadsheet className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="block text-sm font-bold text-ink">B2B Quotation Mode Active</strong>
                    You will not be charged now. Submitting this quote generates a formal GST proposal
                    with your company name, GSTIN, volume discount terms, and validity period.
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Summary Card */}
            <div className="space-y-4">
              <div className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-base text-ink pb-3 border-b border-black/10">
                  {quoteMode ? "Quotation Value Summary" : "Order Summary"}
                </h3>

                {/* Coupon Code Input */}
                {!quoteMode && (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-steel">
                      Have a Promo / Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-steel absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="e.g. SAFETY10"
                          className="w-full pl-8 pr-2 py-1.5 border border-black/20 rounded text-xs uppercase font-medium focus:border-brand outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded text-xs font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Coupon {appliedCoupon.code} applied ({appliedCoupon.percent}% OFF)
                      </p>
                    )}
                    {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                  </form>
                )}

                {/* Calculation Rows */}
                <div className="space-y-2 text-xs pt-2 border-t border-black/5">
                  <div className="flex justify-between text-steel">
                    <span>Subtotal ({cartProducts.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="text-ink font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>Promo Discount</span>
                      <span>- ₹{couponDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-steel">
                    <span>GST (18% Standard Industrial)</span>
                    <span className="text-ink font-medium">₹{gst.toLocaleString("en-IN")}</span>
                  </div>

                  {!quoteMode && (
                    <div className="flex justify-between text-steel">
                      <span>Logistics & Safe Shipping</span>
                      <span>{shipping === 0 ? <strong className="text-green-700">FREE</strong> : `₹${shipping}`}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-bold text-ink">Estimated Total</span>
                      <p className="text-[10px] text-steel">Includes 18% GST invoice</p>
                    </div>
                    <span className="text-xl font-bold text-brand font-display">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  {quoteMode ? (
                    <>
                      <FileSpreadsheet className="w-4 h-4" /> Request Official B2B Quote
                    </>
                  ) : (
                    <>
                      Proceed to Checkout <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[10px] text-steel flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand" /> ISI Marked Stock · 100% Genuine Certified
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
