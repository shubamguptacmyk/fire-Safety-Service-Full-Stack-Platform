import { useSearchParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { CheckCircle2, FileText, ArrowRight, Package, Truck, PhoneCall } from "lucide-react";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || `AK-ORD-${Date.now().toString().slice(-6)}`;

  // Retrieve saved order from localStorage
  const existingOrders = JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
  const order = existingOrders.find((o: any) => o.orderNumber === orderNumber) || existingOrders[0];

  return (
    <>
      <Seo
        title={`Order Confirmed — ${orderNumber} | AK Fire Safety`}
        description="Your fire safety equipment order has been confirmed."
      />

      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="font-display text-3xl font-bold text-ink">Order Confirmed!</h1>
        <p className="text-steel text-sm mt-1">
          Thank you for choosing AK Fire Safety Service. We are preparing your order for dispatch.
        </p>

        {/* Order Reference Box */}
        <div className="mt-8 bg-white border border-black/10 rounded-xl p-6 shadow-sm text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-black/10 gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-steel">Order Reference</span>
              <p className="text-lg font-bold font-mono text-brand">{orderNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-steel">Estimated Dispatch</span>
              <p className="text-sm font-semibold text-ink">Within 24 to 48 Hours</p>
            </div>
          </div>

          {order && (
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-ink block mb-1">Delivering To:</span>
                <p className="text-steel leading-snug">
                  {order.customer?.name}
                  {order.customer?.companyName && ` (${order.customer.companyName})`}
                  <br />
                  {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.pincode}
                  <br />
                  Phone: {order.customer?.phone}
                </p>
              </div>

              <div>
                <span className="font-bold text-ink block mb-1">Payment & Billing:</span>
                <p className="text-steel leading-snug">
                  Total Paid / COD: <strong className="text-ink">₹{order.pricing?.grandTotal?.toLocaleString("en-IN")}</strong>
                  <br />
                  Method: {order.paymentMethod?.toUpperCase()}
                  <br />
                  Status: {order.status}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="pt-4 border-t border-black/10">
            <span className="text-xs font-bold text-ink block mb-3">Order Status Progression</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 rounded font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Order Placed
              </div>
              <div className="p-2.5 bg-paper border border-black/10 text-steel rounded flex items-center justify-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Warehouse Packing
              </div>
              <div className="p-2.5 bg-paper border border-black/10 text-steel rounded flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Dispatched
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/orders"
            className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-md flex items-center gap-2 shadow-sm transition-colors"
          >
            <Package className="w-4 h-4" /> View My Orders
          </Link>

          <Link
            to="/invoices"
            className="px-5 py-2.5 bg-white border border-black/15 hover:bg-paper text-ink text-xs font-semibold rounded-md flex items-center gap-2 shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4 text-brand" /> Download Tax Invoice
          </Link>

          <Link
            to="/products"
            className="px-5 py-2.5 text-xs text-steel hover:text-ink font-semibold flex items-center gap-1"
          >
            Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Support note */}
        <div className="mt-10 p-4 bg-paper rounded-lg border border-black/10 flex items-center justify-center gap-2 text-xs text-steel">
          <PhoneCall className="w-4 h-4 text-brand shrink-0" />
          <span>Need immediate dispatch assistance? Contact our Navi Mumbai dispatch desk at <strong>+91 98000 00000</strong>.</span>
        </div>
      </main>
    </>
  );
}
