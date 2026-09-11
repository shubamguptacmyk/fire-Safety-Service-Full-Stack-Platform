import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import AccountNav from "@/components/AccountNav";
import { orderService } from "@/services/orderService";
import { Package, Truck, CheckCircle2, FileText, ArrowRight, Clock, ShieldAlert, Loader2 } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const apiOrders = await orderService.getMyOrders();
        if (apiOrders && apiOrders.length > 0) {
          setOrders(apiOrders);
          setIsLoading(false);
          return;
        }
      } catch {
        /* guest or token not set, fallback to localStorage */
      }

      try {
        const saved = JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
        setOrders(saved);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <>
      <Seo
        title="My Orders & Equipment History — AK Fire Safety Service"
        description="Track status of your fire extinguisher and hydrant equipment orders."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-display font-bold text-ink">My Equipment Orders</h1>
          <p className="text-xs text-steel mt-0.5">
            Track live dispatch status, delivery schedules, and access official GST tax invoices for compliance audits.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />

          <div className="flex-1 min-w-0 w-full">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-black/10 rounded-2xl p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-10 bg-slate-100 rounded w-full" />
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 bg-white border border-black/10 rounded-2xl text-center max-w-md mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-steel/50" />
                </div>
                <h2 className="font-display font-bold text-lg text-ink">No Orders Placed Yet</h2>
                <p className="text-steel text-xs sm:text-sm mt-1 leading-relaxed">
                  All your commercial fire safety equipment orders, dispatch schedules, and invoices will appear here.
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-lg shadow-md transition-all"
                >
                  Browse Equipment Catalog <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, idx) => {
                  const isDelivered = order.status === "Delivered";
                  const orderId = order.orderNumber || order._id;

                  return (
                    <div
                      key={orderId || idx}
                      className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-brand/30 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-black/10 gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-steel">Order ID</span>
                          <p className="text-sm font-bold font-mono text-ink">{order.orderNumber || order._id}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-steel block">Ordered On</span>
                            <span className="text-xs text-ink font-medium">
                              {order.date || order.createdAt
                                ? new Date(order.date || order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                              isDelivered
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {order.status || "Processing"}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-black/5 last:border-0">
                            <div>
                              <span className="font-semibold text-ink">{item.name || item.product?.name || "Equipment Item"}</span>
                              <span className="text-steel ml-2 font-mono">x {item.quantity}</span>
                            </div>
                            <span className="font-bold text-ink">
                              ₹{((item.price || item.product?.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-steel">Total Amount (incl. GST): </span>
                          <strong className="text-base font-bold text-ink ml-1 font-display">
                            ₹{(order.pricing?.grandTotal || order.totalAmount || 0).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Link
                            to={`/orders/${order.orderNumber || order._id}`}
                            className="px-3.5 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Order &amp; Details
                          </Link>
                          <Link
                            to="/invoices"
                            className="px-3.5 py-2 bg-paper hover:bg-gray-200 border border-black/10 rounded-lg text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand" /> Tax Invoice
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
