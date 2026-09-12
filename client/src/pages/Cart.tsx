import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Breadcrumb from "@/components/ui/Breadcrumb";
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
  ArrowLeft,
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { lines, updateQuantity, removeItem, clear, quoteMode, setQuoteMode } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Fetch product details for all IDs currently in cart
  const { data: allProducts = [] } = useQuery({
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
        title="Shopping Cart &amp; B2B Quote Tray — Shubam Fire Protection"
        description="Review selected fire safety equipment, apply coupon discounts, review GST tax breakdown, or convert directly to a B2B quotation request."
      />

      <div className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: "Cart & Quotation Tray" }]} />
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-dark">
              {quoteMode ? "B2B Quotation Tray" : "Commercial Shopping Cart"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {quoteMode
                ? "Review items for a formal GST project quotation with statutory compliance documentation"
                : "Review selected equipment and proceed with direct checkout"}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-2xs border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setQuoteMode(false)}
              className={`flex-1 sm:flex-none justify-center px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                !quoteMode
                  ? "bg-white text-dark shadow-xs"
                  : "text-slate-600 hover:text-dark"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-primary-700 shrink-0" />
              <span>Direct Purchase</span>
            </button>
            <button
              onClick={() => setQuoteMode(true)}
              className={`flex-1 sm:flex-none justify-center px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                quoteMode
                  ? "bg-primary-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-dark"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Request B2B Quote</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {lines.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-10 h-10 text-slate-400" />}
            title="Your Cart &amp; Quote Tray is Empty"
            description="You haven't selected any fire extinguishers, hydrants, or safety gear yet."
            action={
              <Link to="/products">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Safety Equipment Catalog
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
                <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <span>Equipment Selection ({cartProducts.length} items)</span>
                  <button
                    onClick={clear}
                    className="text-slate-500 hover:text-red-600 transition-colors normal-case font-semibold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Tray</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
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
                        className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <img
                          src={img}
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded-xl bg-white border border-slate-200 p-1 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">
                            {item.brand} &bull; SKU: {item.SKU}
                          </span>
                          <Link
                            to={`/product/${item.slug}`}
                            className="block text-sm font-bold text-dark hover:text-primary-700 transition-colors truncate mt-0.5"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            {item.capacity && <span>Capacity: {item.capacity}</span>}
                            {item.fireClass?.length > 0 && (
                              <span>&bull; Class {item.fireClass.slice(0, 2).join(", ")}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Line Total */}
                        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="p-1.5 hover:bg-slate-50 text-dark transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1.5 hover:bg-slate-50 text-dark disabled:opacity-40 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[90px]">
                            <span className="text-base font-extrabold text-dark font-display block">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ₹{itemPrice.toLocaleString("en-IN")} each
                            </span>
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

              {/* B2B Quotation Info Box */}
              {quoteMode && (
                <div className="p-5 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-start gap-3.5 text-dark">
                  <FileSpreadsheet className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="block text-sm font-bold text-dark font-display">
                      B2B Quotation Mode Active
                    </strong>
                    <p className="text-slate-600 leading-relaxed">
                      You will not be billed immediately. Submitting this quotation request generates an official GST quotation with company details, bulk volume terms, and validity period for your purchase committee review.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Browsing Catalog</span>
                </Link>
              </div>
            </div>

            {/* Right Col: Summary Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
                <h3 className="font-display font-extrabold text-base text-dark pb-3 border-b border-slate-100">
                  {quoteMode ? "Quotation Value Summary" : "Commercial Order Summary"}
                </h3>

                {/* Coupon Code Form */}
                {!quoteMode && (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Corporate Promo / Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="e.g. SAFETY10"
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs uppercase font-semibold focus:border-primary-600 outline-none transition-colors"
                        />
                      </div>
                      <Button variant="outline" size="sm" type="submit">
                        Apply
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Coupon {appliedCoupon.code} applied ({appliedCoupon.percent}% OFF)
                      </p>
                    )}
                    {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
                  </form>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cartProducts.reduce((s, i) => s + i.quantity, 0)} units)</span>
                    <span className="text-dark font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Corporate Discount</span>
                      <span>- ₹{couponDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>GST (18% Statutory Industrial)</span>
                    <span className="text-dark font-bold">₹{gst.toLocaleString("en-IN")}</span>
                  </div>

                  {!quoteMode && (
                    <div className="flex justify-between text-slate-600">
                      <span>Logistics &amp; Direct Delivery</span>
                      <span>
                        {shipping === 0 ? (
                          <strong className="text-emerald-700">FREE SHIPPING</strong>
                        ) : (
                          `₹${shipping}`
                        )}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-extrabold text-dark font-display">
                        Total Amount
                      </span>
                      <p className="text-[10px] text-slate-400">Includes 18% GST invoice</p>
                    </div>
                    <span className="text-2xl font-extrabold text-primary-700 font-display">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleProceed}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {quoteMode ? "Proceed to Quotation Request" : "Proceed to Secure Checkout"}
                </Button>

                <div className="pt-2 text-center">
                  <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Govt. Approved Licensed Agency &bull; 100% Genuine Stock</span>
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
