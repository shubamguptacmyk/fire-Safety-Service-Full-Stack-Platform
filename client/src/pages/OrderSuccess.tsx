import { useSearchParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import { CheckCircle2, FileText, ArrowRight, Package, Truck, PhoneCall, ShieldCheck } from "lucide-react";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber =
    searchParams.get("orderNumber") || `SFP-ORD-${Date.now().toString().slice(-6)}`;

  // Retrieve saved order from localStorage
  const existingOrders =
    JSON.parse(localStorage.getItem("shubam_customer_orders") || "null") ||
    JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
  const order =
    existingOrders.find((o: any) => o.orderNumber === orderNumber) || existingOrders[0];

  return (
    <>
      <Seo
        title={`Order Confirmed — ${orderNumber} | Shubam Fire Protection`}
        description="Your fire safety equipment order has been confirmed by Shubam Fire Protection."
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
          Commercial Order Confirmed!
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Thank you for trusting Shubam Fire Protection. Our logistics team is packing and certifying your equipment for dispatch.
        </p>

        {/* Order Details Card */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card text-left space-y-5">
          <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-100 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Order Tracking Number
              </span>
              <p className="text-xl font-extrabold font-mono text-primary-700 mt-0.5">
                {orderNumber}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Estimated Dispatch
              </span>
              <p className="text-sm font-bold text-dark mt-0.5">Within 24 to 48 Hours</p>
            </div>
          </div>

          {order && (
            <div className="grid sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-dark block text-xs uppercase tracking-wider mb-2">
                  Delivery Site
                </span>
                <p className="font-semibold text-dark">
                  {order.customer?.name}
                  {order.customer?.companyName && ` (${order.customer.companyName})`}
                </p>
                <p className="text-slate-600 leading-snug">
                  {order.shippingAddress?.line1}
                  {order.shippingAddress?.line2 && `, ${order.shippingAddress?.line2}`}
                  <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.pincode}
                </p>
                <p className="text-slate-500 pt-1 font-mono">Contact: {order.customer?.phone}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-dark block text-xs uppercase tracking-wider mb-2">
                  Billing &amp; Tax Status
                </span>
                <p className="text-slate-600">
                  Total Value:{" "}
                  <strong className="text-dark font-extrabold text-sm">
                    ₹{order.pricing?.grandTotal?.toLocaleString("en-IN") || "—"}
                  </strong>
                </p>
                <p className="text-slate-600">
                  Method: <span className="font-bold text-dark uppercase">{order.paymentMethod || "Invoice"}</span>
                </p>
                <p className="text-slate-600">
                  Status: <span className="font-semibold text-emerald-700 capitalize">{order.status || "Confirmed"}</span>
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  18% GST Tax Invoice registered with GSTIN.
                </p>
              </div>
            </div>
          )}

          {/* Timeline Status */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-dark block mb-3 uppercase tracking-wider">
              Fulfillment Progression
            </span>
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Order Placed</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-semibold flex items-center justify-center gap-1.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span>Quality Check</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-semibold flex items-center justify-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>Dispatched</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/orders">
            <Button variant="primary" size="md" leftIcon={<Package className="w-4 h-4" />}>
              View My Orders
            </Button>
          </Link>

          <Link to="/invoices">
            <Button variant="outline" size="md" leftIcon={<FileText className="w-4 h-4 text-primary-700" />}>
              Download Tax Invoice
            </Button>
          </Link>

          <Link to="/products">
            <Button variant="ghost" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="mt-10 p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-600">
          <PhoneCall className="w-4 h-4 text-primary-700 shrink-0" />
          <span>
            Need immediate delivery coordination? Call our dispatch desk at{" "}
            <strong className="text-dark font-bold">+91 98000 00000</strong>.
          </span>
        </div>
      </main>
    </>
  );
}
