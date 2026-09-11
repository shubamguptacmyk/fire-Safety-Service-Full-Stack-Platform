import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
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
            Track status, delivery schedules, and download GST tax invoices for audits.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="p-16 bg-white border border-black/10 rounded-xl text-center max-w-md mx-auto">
            <Package className="w-12 h-12 text-steel/50 mx-auto mb-3" />
            <h2 className="font-display font-semibold text-lg text-ink">No Orders Placed Yet</h2>
            <p className="text-steel text-xs sm:text-sm mt-1">
              All your commercial orders and delivery invoices will appear here.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-dark transition-colors"
            >
              Browse Equipment Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const isDelivered = order.status === "Delivered";
              return (
                <div
                  key={idx}
                  className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-black/10 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-steel">Order ID</span>
                      <p className="text-sm font-bold font-mono text-ink">{order.orderNumber}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-steel block">Ordered On</span>
                        <span className="text-xs text-ink font-medium">
                          {new Date(order.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                          isDelivered
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <div>
                          <span className="font-semibold text-ink">{item.name}</span>
                          <span className="text-steel ml-2">x {item.quantity}</span>
                        </div>
                        <span className="font-bold text-ink">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-steel">Total Amount: </span>
                      <strong className="text-sm font-bold text-ink">
                        ₹{(order.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        to={`/orders/${order.orderNumber}`}
                        className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" /> View Tracking & Details
                      </Link>
                      <Link
                        to={`/invoices`}
                        className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded text-xs font-semibold text-ink flex items-center gap-1"
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
      </main>
    </>
  );
}
