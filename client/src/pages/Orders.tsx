import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { orderService } from "@/services/orderService";
import { Package, Truck, CheckCircle2, FileText, ArrowRight, Clock } from "lucide-react";

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
        const saved =
          JSON.parse(localStorage.getItem("shubam_customer_orders") || "null") ||
          JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
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
        title="My Equipment Orders — Shubam Fire Protection"
        description="Track status, logistics, and Form B inspection certificates for your fire safety equipment orders."
      />

      <div className="bg-slate-50 border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: "Customer Portal", href: "/profile" },
              { label: "Equipment Orders" },
            ]}
          />
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-dark">
            Equipment Procurement &amp; Order History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track shipment dispatches, review consignment details, and access GST tax invoices
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-10 h-10 text-slate-400" />}
            title="No Orders Placed Yet"
            description="All your commercial equipment orders, dispatch status, and delivery invoices will appear here."
            action={
              <Link to="/products">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Browse Equipment Catalog
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const isDelivered = order.status === "Delivered";
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Consignment Order ID
                      </span>
                      <p className="text-base font-extrabold font-mono text-dark mt-0.5">
                        {order.orderNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Date
                        </span>
                        <span className="text-xs text-dark font-medium">
                          {new Date(order.date || order.createdAt || Date.now()).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                          isDelivered
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                      >
                        {isDelivered ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{order.status || "Processing"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-2">
                        <div>
                          <span className="font-bold text-dark">{item.name}</span>
                          <span className="text-slate-400 ml-2 font-medium">x {item.quantity}</span>
                        </div>
                        <span className="font-bold text-dark font-display">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Invoice Total: </span>
                      <strong className="text-base font-extrabold text-dark font-display">
                        ₹{(order.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link to={`/orders/${order.orderNumber}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Truck className="w-3.5 h-3.5" />}
                        >
                          Tracking &amp; Status
                        </Button>
                      </Link>
                      <Link to="/invoices">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<FileText className="w-3.5 h-3.5 text-primary-700" />}
                        >
                          Tax Invoice
                        </Button>
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
