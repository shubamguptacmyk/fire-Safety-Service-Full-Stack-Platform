import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import Seo from "@/components/Seo";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Banknote,
} from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { lines, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  // B2B Details
  const [isB2B, setIsB2B] = useState(Boolean(user?.gstNumber || user?.companyName));
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || "");

  // Address
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("Navi Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("410206");
  const [sameBilling, setSameBilling] = useState(true);

  // Options
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express" | "pickup">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"mock" | "cod" | "razorpay">("mock");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch cart products
  const { data: allProducts = [] } = useQuery({
    queryKey: ["checkout-products-fetch", lines.map((l) => l.productId).sort().join(",")],
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
    .filter(Boolean);

  const subtotal = cartProducts.reduce((sum, item) => {
    const price = item ? (item.discountPrice || item.price) : 0;
    return sum + price * (item?.quantity || 1);
  }, 0);

  const gst = Math.round(subtotal * 0.18);
  const shippingFee = deliveryMethod === "pickup" ? 0 : deliveryMethod === "express" ? 450 : subtotal > 5000 ? 0 : 250;
  const grandTotal = subtotal + gst + shippingFee;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !line1 || !pincode) return;

    setIsSubmitting(true);

    try {
      const res = await orderService.createOrder({
        customer: {
          name,
          phone,
          email: email || undefined,
          companyName: companyName || undefined,
          gstNumber: gstNumber || undefined,
        },
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        shippingAddress: { line1, line2, city, state, pincode },
        deliveryMethod,
        paymentMethod,
      });

      // Keep backup in localStorage for instant receipt view
      try {
        const existing = JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
        existing.unshift(res.order);
        localStorage.setItem("ak_customer_orders", JSON.stringify(existing));
      } catch {
        /* ignore */
      }

      clear();
      navigate(`/order-success?orderNumber=${res.order.orderNumber}`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Secure Checkout — AK Fire Safety Service"
        description="Complete your order for fire safety equipment. Free shipping above ₹5000 in Mumbai & MMR."
      />

      <div className="bg-paper border-b border-black/10 py-5">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-ink">Checkout & Delivery</h1>
          <div className="flex items-center gap-1.5 text-xs text-steel">
            <Lock className="w-3.5 h-3.5 text-green-700" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Customer Contact */}
            <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-display">
                  1
                </span>
                Contact Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Phone Number (For Delivery OTP) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Email Address (For Tax Invoice & Tracking)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              {/* B2B GST Toggle */}
              <div className="pt-2 border-t border-black/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={isB2B}
                    onChange={(e) => setIsB2B(e.target.checked)}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <span>Ordering for a Business / Society (Add GSTIN for Tax Credit)</span>
                </label>

                {isB2B && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-3 p-3.5 bg-paper rounded border border-black/10">
                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">Company / Society Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Tech Park Ltd"
                        className="w-full px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="27AAAAA0000A1Z5"
                        className="w-full px-3 py-1.5 border border-black/20 rounded text-xs uppercase focus:border-brand outline-none bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-display">
                  2
                </span>
                Delivery Address
              </h2>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Flat / Wing / Building / Street *</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Plot 42, Sector 19, Vashi"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Area / Landmark / Floor</label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Near APMC Market, 3rd Floor"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400703"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Delivery Method */}
            <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="font-bold text-base text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-display">
                  3
                </span>
                Logistics Preference
              </h2>

              <div className="grid sm:grid-cols-3 gap-3">
                <label
                  className={`p-3.5 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                    deliveryMethod === "standard"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-4 h-4 text-brand" />
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "standard"}
                      onChange={() => setDeliveryMethod("standard")}
                      className="text-brand"
                    />
                  </div>
                  <p className="text-xs font-bold text-ink">Standard Transport</p>
                  <p className="text-[11px] text-steel mt-0.5">2-3 business days (Free &gt; ₹5,000)</p>
                </label>

                <label
                  className={`p-3.5 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                    deliveryMethod === "express"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-4 h-4 text-amber" />
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "express"}
                      onChange={() => setDeliveryMethod("express")}
                      className="text-brand"
                    />
                  </div>
                  <p className="text-xs font-bold text-ink">Express 24-Hr Courier</p>
                  <p className="text-[11px] text-steel mt-0.5">Next morning dispatch (+ ₹450)</p>
                </label>

                <label
                  className={`p-3.5 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="w-4 h-4 text-steel" />
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === "pickup"}
                      onChange={() => setDeliveryMethod("pickup")}
                      className="text-brand"
                    />
                  </div>
                  <p className="text-xs font-bold text-ink">Self Warehouse Pickup</p>
                  <p className="text-[11px] text-steel mt-0.5">Navi Mumbai Depot (Free)</p>
                </label>
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="font-bold text-base text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-display">
                  4
                </span>
                Payment Options
              </h2>

              <div className="space-y-2.5">
                <label
                  className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === "mock"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-brand" />
                    <div>
                      <p className="text-xs font-bold text-ink">Instant Mock Payment (Development Safe Mode)</p>
                      <p className="text-[11px] text-steel">Simulates real UPI/Card payment without charging real money</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "mock"}
                    onChange={() => setPaymentMethod("mock")}
                    className="text-brand"
                  />
                </label>

                <label
                  className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === "cod"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-green-700" />
                    <div>
                      <p className="text-xs font-bold text-ink">Cash / Cheque on Delivery (COD)</p>
                      <p className="text-[11px] text-steel">Pay upon equipment delivery & physical inspection</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-brand"
                  />
                </label>

                <label
                  className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === "razorpay"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-ink">Razorpay Gateway (Netbanking / Cards / UPI)</p>
                      <p className="text-[11px] text-steel">Supports live & test mode Razorpay credentials</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="text-brand"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Col: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-display font-bold text-base text-ink pb-3 border-b border-black/10">
                Order Summary ({cartProducts.reduce((s, i) => s + (i?.quantity || 1), 0)} items)
              </h3>

              {/* Items Mini List */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {cartProducts.map((p) => (
                  <div key={p?._id} className="flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <p className="font-semibold text-ink truncate">{p?.name}</p>
                      <p className="text-[10px] text-steel">Qty: {p?.quantity}</p>
                    </div>
                    <span className="font-bold text-ink shrink-0">
                      ₹{(((p?.discountPrice || p?.price) || 0) * (p?.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-black/10">
                <div className="flex justify-between text-steel">
                  <span>Subtotal</span>
                  <span className="text-ink font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>GST (18%)</span>
                  <span className="text-ink font-medium">₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-green-700">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-ink">Grand Total</span>
                    <p className="text-[10px] text-steel">Tax Invoice generated upon submission</p>
                  </div>
                  <span className="text-xl font-bold text-brand font-display">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cartProducts.length === 0}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Generating Order..." : "Confirm & Place Order"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-steel text-center space-y-1 pt-1">
                <p>✓ All equipment includes 1-Year Manufacturer Warranty</p>
                <p>✓ Compliant with IS 15683 & Maharashtra Fire Act</p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
