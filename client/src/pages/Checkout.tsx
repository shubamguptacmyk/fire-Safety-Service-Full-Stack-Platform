import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileCheck,
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

  // Options
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express" | "pickup">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"mock" | "cod" | "razorpay">("mock");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  const shippingFee =
    deliveryMethod === "pickup"
      ? 0
      : deliveryMethod === "express"
      ? 450
      : subtotal > 5000
      ? 0
      : 250;
  const grandTotal = subtotal + gst + shippingFee;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    if (!name || !phone || !line1 || !pincode) {
      setErrorMessage("Please complete all required fields (Name, Phone, Address Line, Pincode).");
      return;
    }

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

      // Keep backup in localStorage
      try {
        const existing =
          JSON.parse(localStorage.getItem("shubam_customer_orders") || "null") ||
          JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
        existing.unshift(res.order);
        localStorage.setItem("shubam_customer_orders", JSON.stringify(existing));
        localStorage.setItem("ak_customer_orders", JSON.stringify(existing));
      } catch {
        /* ignore */
      }

      clear();
      navigate(`/order-success?orderNumber=${res.order.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to process your order. Please verify your connection or try another payment method."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Secure Commercial Checkout — Shubam Fire Protection"
        description="Complete your order for fire safety equipment. Safe shipping and official GST tax invoices issued across Maharashtra."
      />

      <div className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: "Cart", href: "/cart" },
              { label: "Secure Checkout" },
            ]}
          />
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-dark">
              Checkout &amp; Delivery Details
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Provide installation address and billing particulars for official GST invoice generation
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted Order Processing</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Columns: Forms */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Contact Particulars */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-bold text-base font-display text-dark">Contact Information</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                />
                <Input
                  label="Phone Number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9820012345"
                />
              </div>

              <Input
                label="Official Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                helperText="Order confirmations and GST e-invoices are delivered to this address."
              />

              {/* B2B Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 text-xs font-bold text-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isB2B}
                    onChange={(e) => setIsB2B(e.target.checked)}
                    className="rounded border-slate-300 text-primary-700 focus:ring-primary-600 w-4 h-4"
                  />
                  <span>This is an official Company / Corporate Purchase (GST Input Tax Credit)</span>
                </label>

                {isB2B && (
                  <div className="grid sm:grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <Input
                      label="Company / Enterprise Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Industries Ltd."
                    />
                    <Input
                      label="GSTIN Number"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="e.g. 27AABCS1234F1Z8"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Delivery & Site Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-bold text-base font-display text-dark">
                  Delivery Site / Premise Address
                </h2>
              </div>

              <Input
                label="Building / Industrial Plot / Street Address"
                required
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="e.g. Plot C-12, Sector 19, Turbhe MIDC"
              />

              <Input
                label="Floor / Unit / Landmark (Optional)"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="e.g. 3rd Floor, Near Toll Plaza"
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="State"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                <Input
                  label="PIN Code"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400705"
                />
              </div>
            </div>

            {/* 3. Delivery Method & Payment */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-bold text-base font-display text-dark">
                  Logistics &amp; Payment Preference
                </h2>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Delivery Dispatch Option
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "standard",
                      title: "Standard Logistics",
                      desc: "2-3 business days. Free above ₹5000.",
                      fee: subtotal > 5000 ? "FREE" : "₹250",
                    },
                    {
                      id: "express",
                      title: "Express Van Delivery",
                      desc: "Next-day dispatch across MMR.",
                      fee: "₹450",
                    },
                    {
                      id: "pickup",
                      title: "Workshop Self Pickup",
                      desc: "Collect from Vashi/Turbhe workshop.",
                      fee: "FREE",
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setDeliveryMethod(opt.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        deliveryMethod === opt.id
                          ? "border-primary-700 bg-primary-50/40 shadow-xs ring-1 ring-primary-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-dark">
                        <span>{opt.title}</span>
                        <span className="text-primary-700">{opt.fee}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Payment Method
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "mock",
                      title: "Corporate NetBanking / UPI",
                      desc: "Instant verified transaction",
                    },
                    {
                      id: "cod",
                      title: "Cash on Delivery",
                      desc: "Pay on receipt at site",
                    },
                    {
                      id: "razorpay",
                      title: "Commercial Card / PO",
                      desc: "Credit cards & corporate PO",
                    },
                  ].map((pay) => (
                    <div
                      key={pay.id}
                      onClick={() => setPaymentMethod(pay.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === pay.id
                          ? "border-primary-700 bg-primary-50/40 shadow-xs ring-1 ring-primary-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-dark">{pay.title}</div>
                      <p className="text-[11px] text-slate-500 mt-1">{pay.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Submit */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
              <h3 className="font-display font-extrabold text-base text-dark pb-3 border-b border-slate-100">
                Order Review ({cartProducts.length} items)
              </h3>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs pr-1">
                {cartProducts.map((item) => (
                  <div key={item?._id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="truncate flex-1">
                      <span className="font-semibold text-dark truncate block">{item?.name}</span>
                      <span className="text-[10px] text-slate-400">Qty: {item?.quantity}</span>
                    </div>
                    <span className="font-bold text-dark shrink-0">
                      ₹{(((item?.discountPrice || item?.price) ?? 0) * (item?.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-dark font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Statutory)</span>
                  <span className="text-dark font-bold">₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="text-dark font-bold">
                    {shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-extrabold text-dark font-display">
                      Grand Total
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
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Confirm &amp; Place Order
              </Button>

              <div className="pt-2 text-center text-[10px] text-slate-500 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Statutory Form B Inspection Warranty Included</span>
                </p>
                <p>Official GST e-invoice generated automatically upon placement.</p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
