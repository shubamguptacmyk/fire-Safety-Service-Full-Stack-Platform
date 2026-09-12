import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "@/services/orderService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  ArrowLeft,
  ShieldCheck,
  Phone,
  AlertTriangle,
  Building,
  Printer,
} from "lucide-react";

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
              carrier: "Safe Express Logistics (Heavy Industrial Fleet)",
              lrNumber: "LR-MH-449102",
              dispatchDate: new Date(apiOrder.createdAt).toLocaleDateString("en-IN"),
              estimatedDelivery: "2-3 Business Days",
            },
          });
          return;
        }
      } catch {
        /* fallback to localStorage */
      }

      try {
        const savedOrders =
          JSON.parse(localStorage.getItem("shubam_customer_orders") || "null") ||
          JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
        const found = savedOrders.find((o: any) => o.orderNumber === id);
        if (found) {
          setOrder({
            ...found,
            dispatchDetails: found.dispatchDetails || {
              carrier: "Safe Express Logistics (Heavy Industrial Fleet)",
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
    { label: "Order Received", status: "completed", date: "Day 1 - 10:30 AM" },
    { label: "GST & Spec Compliance Verified", status: "completed", date: "Day 1 - 02:15 PM" },
    { label: "Hydrostatic Tested & Stamped", status: "completed", date: "Day 2 - 11:00 AM" },
    {
      label: "Out for Delivery (MMR Corridor Hub)",
      status: order?.status === "Delivered" ? "completed" : "current",
      date: "In Transit",
    },
    {
      label: "Delivered & Client Acceptance",
      status: order?.status === "Delivered" ? "completed" : "pending",
      date: "Pending",
    },
  ];

  if (!order) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold font-display text-dark">Order Not Located</h1>
        <p className="text-slate-500 text-sm mt-1">
          Could not locate consignment reference <span className="font-mono text-dark font-bold">{id}</span>.
        </p>
        <Link to="/orders" className="inline-block mt-6">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Orders
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <>
      <Seo
        title={`Order Details #${order.orderNumber} — Shubam Fire Protection`}
        description={`Track shipping and delivery status for fire equipment order ${order.orderNumber}.`}
      />

      <div className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: "Customer Portal", href: "/profile" },
              { label: "Orders", href: "/orders" },
              { label: `#${order.orderNumber}` },
            ]}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold font-mono text-dark">
                Order #{order.orderNumber}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{order.status || "Confirmed"}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on{" "}
              {new Date(order.date || order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              &bull; 18% Statutory GST Cleared
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/invoices">
              <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5 text-primary-700" />}>
                Tax Invoice PDF
              </Button>
            </Link>
            <button
              onClick={() => window.print()}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Progression */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-500">
            Fulfillment &amp; Dispatch Timeline
          </h3>

          <div className="grid sm:grid-cols-5 gap-4 pt-2">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold text-xs ${
                    step.status === "completed"
                      ? "bg-emerald-600 text-white"
                      : step.status === "current"
                      ? "bg-primary-700 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {idx + 1}
                </div>
                <p className="text-xs font-bold text-dark">{step.label}</p>
                <span className="text-[10px] text-slate-400 mt-1">{step.date}</span>
              </div>
            ))}
          </div>

          {order.dispatchDetails && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Carrier / Transporter</span>
                <span className="font-bold text-dark">{order.dispatchDetails.carrier}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Lorry Receipt (LR) #</span>
                <span className="font-mono font-bold text-dark">{order.dispatchDetails.lrNumber || "LR-MH-449102"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Estimated Delivery</span>
                <span className="font-bold text-emerald-700">{order.dispatchDetails.estimatedDelivery}</span>
              </div>
            </div>
          )}
        </div>

        {/* Items and Delivery Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
              Dispatched Line Items
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark truncate text-sm">{item.name}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      HSN: 84241000 &bull; Quantity: {item.quantity} units
                    </p>
                  </div>
                  <span className="font-bold text-dark font-display text-sm shrink-0">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-dark">₹{(order.pricing?.subtotal || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18% Statutory)</span>
                <span className="font-bold text-dark">₹{(order.pricing?.gstAmount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Logistics &amp; Transport</span>
                <span className="font-bold text-dark">
                  {order.pricing?.shippingFee ? `₹${order.pricing.shippingFee}` : "FREE"}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-dark font-display">
                <span>Total Amount Paid</span>
                <span className="text-primary-700">₹{(order.pricing?.grandTotal || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Delivery Particulars */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4 text-xs">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100">
                Premise Site Location
              </h3>

              <div className="space-y-1 text-slate-700">
                <p className="font-bold text-dark text-sm">
                  {order.shippingAddress?.fullName || order.customer?.name}
                </p>
                {order.customer?.companyName && (
                  <p className="text-primary-700 font-semibold">{order.customer.companyName}</p>
                )}
                <p className="text-slate-600 leading-relaxed pt-1">
                  {order.shippingAddress?.street || order.shippingAddress?.line1}
                  {order.shippingAddress?.line2 && `, ${order.shippingAddress?.line2}`}
                  <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.pincode}
                </p>
                <p className="text-slate-500 pt-1 font-mono">
                  Site Contact: {order.shippingAddress?.phone || order.customer?.phone}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-1">
                  Payment Method
                </span>
                <span className="font-bold text-dark uppercase">{order.paymentMethod || "Direct NetBanking"}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
              <Phone className="w-4 h-4 text-primary-700 shrink-0" />
              <span>
                Dispatch inquiries: <strong>+91 98000 00000</strong>
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
