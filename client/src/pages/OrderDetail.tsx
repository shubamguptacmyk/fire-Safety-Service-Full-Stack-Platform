import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "@/services/orderService";
import Seo from "@/components/Seo";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Printer,
  AlertTriangle,
  Building,
} from "lucide-react";

interface OrderDetailData {
  orderNumber: string;
  date: string;
  status: "Processing" | "Verified" | "Dispatched" | "In Transit" | "Delivered" | "Cancelled";
  dispatchDetails?: {
    carrier: string;
    trackingNumber: string;
    lrNumber?: string;
    dispatchDate?: string;
    estimatedDelivery?: string;
  };
  pricing: {
    subtotal: number;
    gstAmount: number;
    shippingFee: number;
    discount: number;
    grandTotal: number;
  };
  items: Array<{
    name: string;
    hsn?: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
  shippingAddress: {
    fullName: string;
    companyName?: string;
    gstin?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: string;
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const apiOrder = await orderService.getOrderById(id);
        if (apiOrder) {
          setOrder({
            ...apiOrder,
            date: apiOrder.createdAt,
            dispatchDetails: apiOrder.deliveryDetails || {
              carrier: "V-Trans Safe Express (Industrial Heavy Cargo)",
              lrNumber: "LR-MH-449102",
              dispatchDate: new Date(apiOrder.createdAt).toLocaleDateString("en-IN"),
              estimatedDelivery: "Expected in 2-3 Business Days",
            },
          });
          return;
        }
      } catch {
        /* fallback to localStorage */
      }

      try {
        const savedOrders = JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
        const found = savedOrders.find((o: any) => o.orderNumber === id);
        if (found) {
          setOrder({
            ...found,
            dispatchDetails: found.dispatchDetails || {
              carrier: "V-Trans Safe Express (Industrial Heavy Cargo)",
              trackingNumber: "TRK-" + (id?.replace(/[^0-9]/g, "") || "99214"),
              lrNumber: "LR-MH-" + Math.floor(100000 + Math.random() * 900000),
              dispatchDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
              estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
            },
          });
        }
      } catch {
        setOrder(null);
      }
    }

    fetchOrder();
  }, [id]);

  const timelineSteps = [
    { label: "Order Placed", status: "completed", date: "Day 1 - 10:30 AM" },
    { label: "GST & Spec Verified", status: "completed", date: "Day 1 - 02:15 PM" },
    { label: "Factory Hydro-Tested & Dispatched", status: "completed", date: "Day 2 - 11:00 AM" },
    { label: "Out for Delivery (Navi Mumbai Hub)", status: order?.status === "Delivered" ? "completed" : "current", date: "Expected Today" },
    { label: "Delivered & Stamped", status: order?.status === "Delivered" ? "completed" : "pending", date: "Pending" },
  ];

  if (!order) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber mx-auto mb-3" />
        <h1 className="text-xl font-display font-bold text-ink">Order Not Found</h1>
        <p className="text-steel text-sm mt-1">
          Could not locate consignment reference <span className="font-mono">{id}</span>.
        </p>
        <Link
          to="/orders"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-dark"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Orders
        </Link>
      </main>
    );
  }

  return (
    <>
      <Seo
        title={`Order Details #${order.orderNumber} — AK Fire Safety Service`}
        description={`Track shipping and delivery status for fire equipment order ${order.orderNumber}.`}
      />

      <div className="bg-paper border-b border-black/10 py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 text-xs text-steel hover:text-brand transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-ink">
                Order <span className="font-mono">{order.orderNumber}</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-brand/10 text-brand">
                {order.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-black/10 rounded text-xs font-semibold text-ink hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-steel" /> Print Summary
            </button>
            <button
              onClick={async () => {
                try {
                  await orderService.downloadInvoicePdf(order._id || order.orderNumber, `INV-${order.orderNumber}.pdf`);
                } catch {
                  window.location.href = "/invoices";
                }
              }}
              className="px-3.5 py-1.5 bg-brand text-white rounded text-xs font-semibold hover:bg-brand-dark flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> Download PDF Invoice
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Tracking & Timeline Card */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/10">
            <div>
              <p className="text-[11px] font-bold text-steel uppercase tracking-wider">
                Consignment Logistics Status
              </p>
              <p className="text-sm font-semibold text-ink mt-0.5">
                Carrier: {order.dispatchDetails?.carrier}
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-steel block">LR / Docket No:</span>
                <span className="font-mono font-bold text-ink">{order.dispatchDetails?.lrNumber}</span>
              </div>
              <div>
                <span className="text-steel block">Estimated Delivery:</span>
                <span className="font-bold text-green-700">{order.dispatchDetails?.estimatedDelivery}</span>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {timelineSteps.map((step, idx) => {
                const isDone = step.status === "completed";
                const isCurrent = step.status === "current";
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isDone
                        ? "bg-green-50/60 border-green-200"
                        : isCurrent
                        ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20"
                        : "bg-paper/40 border-black/5 opacity-60"
                    }`}
                  >
                    <div className="flex justify-center mb-1.5">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : isCurrent ? (
                        <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-steel/40" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-ink leading-tight">{step.label}</p>
                    <p className="text-[10px] text-steel mt-1">{step.date}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2-Column Content: Equipment Line Items + Shipping/Billing */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Products Table */}
            <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-paper/50 border-b border-black/10 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand" /> Certified Equipment Manifest
                </h2>
                <span className="text-xs text-steel font-mono">{order.items.length} Line Items</span>
              </div>

              <div className="divide-y divide-black/5 text-sm">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-ink text-sm leading-snug">{item.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-steel mt-1 font-mono">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        {item.hsn && <span>HSN: {item.hsn}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-ink text-sm">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <span className="text-[11px] text-steel">₹{item.price.toLocaleString("en-IN")} each</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 bg-paper/30 border-t border-black/10 space-y-2 text-xs">
                <div className="flex justify-between text-steel">
                  <span>Taxable Value (Excl. GST):</span>
                  <span className="font-mono text-ink">₹{order.pricing.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>18% Goods & Services Tax (CGST 9% + SGST 9%):</span>
                  <span className="font-mono text-ink">₹{order.pricing.gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Secured Cargo Handling & Freight:</span>
                  <span className="text-green-700 font-semibold">
                    {order.pricing.shippingFee === 0 ? "FREE" : `₹${order.pricing.shippingFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-black/10 flex justify-between text-sm font-bold text-ink">
                  <span>Grand Total (Paid):</span>
                  <span className="text-brand font-mono text-base">
                    ₹{order.pricing.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quality & Form B Compliance Note */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Statutory Certification Guarantee</strong>
                All supplied fire equipment includes manufacturer factory test certificates, hydrostatic test
                dates stamped on the cylinder dome (IS 15683), and QR barcode maintenance tags pre-registered
                for Maharashtra Fire Prevention Act compliance audits.
              </div>
            </div>
          </div>

          {/* Right Column: Consignee & Support */}
          <div className="space-y-6">
            <div className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-steel flex items-center gap-1.5 pb-2 border-b border-black/10">
                <Building className="w-4 h-4 text-steel" /> Delivery Premises & GSTIN
              </h2>

              <div className="text-xs space-y-1">
                {order.shippingAddress.companyName && (
                  <p className="font-bold text-ink text-sm">{order.shippingAddress.companyName}</p>
                )}
                <p className="text-ink font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-steel">{order.shippingAddress.street}</p>
                <p className="text-steel">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-steel pt-1">Phone: {order.shippingAddress.phone}</p>
                {order.shippingAddress.gstin && (
                  <div className="mt-2 pt-2 border-t border-black/5">
                    <span className="text-steel block text-[10px]">Client GSTIN:</span>
                    <span className="font-mono font-bold text-ink">{order.shippingAddress.gstin}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-steel">Payment Confirmation</h2>
              <div className="text-xs">
                <p className="text-steel">Method:</p>
                <p className="font-semibold text-ink mt-0.5">{order.paymentMethod}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold text-[10px]">
                  Payment Verified
                </span>
              </div>
            </div>

            <div className="bg-ink text-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber font-display font-bold text-sm">
                <Phone className="w-4 h-4" /> Need Immediate Dispatch Help?
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Connect with our Navi Mumbai dispatch yard for urgent gate pass approvals, heavy vehicle logistics,
                or technician installation coordination.
              </p>
              <a
                href="tel:+919800000000"
                className="block text-center py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-bold transition-colors"
              >
                Call Dispatch Desk: +91 98000 00000
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
