import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { adminDashboardService, DashboardOverviewData } from "@/services/adminDashboardService";
import {
  ShoppingBag,
  FileSpreadsheet,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Wrench,
  Users,
  RefreshCw,
  TrendingUp,
  Plus,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  Check,
} from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorState from "@/components/ErrorState";
import StatusBadge from "@/components/StatusBadge";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  confirmed: "#10b981",
  dispatched: "#6366f1",
  delivered: "#059669",
  cancelled: "#ef4444",
  refunded: "#64748b",
};

export default function Dashboard() {
  const user = useAdminAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<"daily" | "monthly">("daily");
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await adminDashboardService.getOverview();
      setData(overview);

      // Fetch monthly trend for comparison
      const rev = await adminDashboardService.getRevenueTrends("monthly").catch(() => null);
      if (rev && Array.isArray(rev)) {
        setMonthlyTrends(rev);
      }
    } catch (err: any) {
      console.error("Dashboard stats failed", err);
      setError(err?.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Format daily trend data for chart
  const chartData =
    trendPeriod === "daily"
      ? (data?.dailyTrend || []).map((d) => ({
          name: d._id ? d._id.slice(5) : "Day",
          revenue: d.revenue || 0,
          orders: d.orders || 0,
        }))
      : monthlyTrends.map((m) => ({
          name: m._id ? `M${m._id.month || m._id}` : "Month",
          revenue: m.revenue || 0,
          orders: m.orders || 0,
        }));

  // Order status chart data
  const orderStatusData = (data?.orderStatusCounts || []).map((item) => ({
    name: item._id ? item._id.replace(/_/g, " ") : "Unknown",
    value: item.count || 0,
    color: STATUS_COLORS[item._id?.toLowerCase()] || "#94a3b8",
  }));

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-black/5 rounded-xl animate-pulse w-72" />
        <LoadingSkeleton type="cards" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-xl border border-black/10 animate-pulse" />
          <div className="h-72 bg-white rounded-xl border border-black/10 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const summary = data?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    totalCustomers: 0,
    newCustomers30d: 0,
    activeAMC: 0,
    expiringAMC: 0,
    totalQuotes: 0,
    lowStockCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-black/10 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink">Administrative Command Center</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-green-50 text-green-700 border border-green-200 rounded-full">
              Live Production
            </span>
          </div>
          <p className="text-xs text-steel mt-1">
            Welcome back, <strong className="text-ink">{user?.name}</strong>. Role:{" "}
            <span className="capitalize font-mono font-bold text-brand">{user?.role?.replace("_", " ")}</span>. Licensed
            Fire Safety Agency operational in Navi Mumbai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3.5 py-2 bg-paper hover:bg-black/5 border border-black/10 text-ink rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between text-steel">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Gross Turnover</span>
            <div className="p-2 bg-red-50 text-brand rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-display font-bold text-ink font-mono">
            ₹{summary.totalRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-green-700 font-semibold block">
            {summary.paidOrders} paid consignments
          </span>
        </div>

        {/* Equipment Orders */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between text-steel">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Orders</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-display font-bold text-ink font-mono">{summary.totalOrders}</div>
          <Link to="/orders" className="text-[10px] text-brand hover:underline font-semibold flex items-center gap-1">
            Dispatch queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active AMC Contracts */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between text-steel">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Active AMC</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-display font-bold text-ink font-mono">{summary.activeAMC}</div>
          <span
            className={`text-[10px] font-semibold block ${
              summary.expiringAMC > 0 ? "text-amber-600 font-bold" : "text-steel"
            }`}
          >
            {summary.expiringAMC > 0 ? `${summary.expiringAMC} expiring in 30d` : "Compliant with Form B"}
          </span>
        </div>

        {/* B2B Quotations */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between text-steel">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">B2B Proposals</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-display font-bold text-ink font-mono">{summary.totalQuotes}</div>
          <Link to="/orders" className="text-[10px] text-brand hover:underline font-semibold flex items-center gap-1">
            Review RFQs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Customer Base */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between text-steel">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Registered CRM</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-display font-bold text-ink font-mono">{summary.totalCustomers}</div>
          <span className="text-[10px] text-purple-700 font-semibold block">
            +{summary.newCustomers30d} new this month
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs space-y-2 hover:border-brand/30 transition-all">
          <div className="flex items-center justify-between text-steel">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Low Stock Alert</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-display font-bold text-ink font-mono">{summary.lowStockCount}</div>
          <Link to="/catalog" className="text-[10px] text-rose-700 hover:underline font-semibold flex items-center gap-1">
            Restock inventory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-steel uppercase tracking-wider font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" /> Operational Shortcuts:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/catalog"
            className="px-3 py-1.5 bg-paper hover:bg-black/5 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-brand" /> Add Equipment
          </Link>
          <Link
            to="/invoices"
            className="px-3 py-1.5 bg-paper hover:bg-black/5 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-brand" /> Issue Tax Invoice
          </Link>
          <Link
            to="/service"
            className="px-3 py-1.5 bg-paper hover:bg-black/5 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-brand" /> New AMC Contract
          </Link>
          <Link
            to="/coupons"
            className="px-3 py-1.5 bg-paper hover:bg-black/5 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-brand" /> Issue Coupon
          </Link>
          <Link
            to="/reports"
            className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5" /> View GST & Sales Reports
          </Link>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-base text-ink">Commercial Billing & Volume Dynamics</h3>
              <p className="text-xs text-steel">Day-by-day revenue velocity and order density</p>
            </div>
            <div className="flex items-center gap-1 bg-paper p-1 rounded-xl border border-black/10 text-xs font-semibold">
              <button
                onClick={() => setTrendPeriod("daily")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  trendPeriod === "daily" ? "bg-brand text-white shadow-2xs" : "text-steel hover:text-ink"
                }`}
              >
                Daily Trends
              </button>
              <button
                onClick={() => setTrendPeriod("monthly")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  trendPeriod === "monthly" ? "bg-brand text-white shadow-2xs" : "text-steel hover:text-ink"
                }`}
              >
                Monthly Trends
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-steel">
                No trend telemetry available yet for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Gross Revenue"]}
                    labelStyle={{ fontWeight: "bold", color: "#111827" }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d32f2f"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Distribution Donut Chart (1 col) */}
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-ink">Fulfillment Status Distribution</h3>
            <p className="text-xs text-steel">Breakdown across active and delivered orders</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {orderStatusData.length === 0 ? (
              <div className="text-xs text-steel">No orders logged in system.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} orders`, name]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-[11px] text-ink font-medium capitalize">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (Low Stock & Expiring AMC) */}
      {(data?.lowStockProducts && data.lowStockProducts.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Critical Inventory Threshold Warnings ({data.lowStockProducts.length} Items)</span>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              Open Inventory Manager <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {data.lowStockProducts.slice(0, 4).map((p) => (
              <div
                key={p._id}
                className="bg-white/80 rounded-xl p-3 border border-amber-200 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-ink block truncate">{p.name}</span>
                  <span className="text-[10px] font-mono text-steel block">SKU: {p.sku || "—"}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-rose-600 font-mono block">{p.stock} in stock</span>
                  <span className="text-[10px] text-steel">Min: {p.lowStockAlert}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Activity Tables: Recent Orders & Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <div>
              <h2 className="font-display font-bold text-base text-ink">Recent Consignments & Orders</h2>
              <p className="text-xs text-steel">Latest equipment dispatch requests</p>
            </div>
            <Link
              to="/orders"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-black/5">
            {!data?.recentOrders || data.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-steel">No orders logged in database yet.</p>
            ) : (
              data.recentOrders.slice(0, 5).map((ord: any) => (
                <div key={ord._id || ord.orderNumber} className="py-3.5 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-ink">{ord.orderNumber}</span>
                      <StatusBadge status={ord.status || "Pending"} size="sm" />
                    </div>
                    <p className="text-steel truncate mt-0.5">
                      {ord.customer?.name || "Client"}
                      {ord.customer?.companyName ? ` (${ord.customer.companyName})` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-ink block">
                      ₹{(ord.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-steel font-mono">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN") : "Today"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Commercial Quotes */}
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <div>
              <h2 className="font-display font-bold text-base text-ink">B2B Quotations & RFQ Pipeline</h2>
              <p className="text-xs text-steel">Commercial proposals awaiting client or staff action</p>
            </div>
            <Link
              to="/orders"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              All Quotes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-black/5">
            {!data?.recentQuotes || data.recentQuotes.length === 0 ? (
              <p className="py-8 text-center text-xs text-steel">No quotations submitted yet.</p>
            ) : (
              data.recentQuotes.slice(0, 5).map((q: any) => (
                <div key={q._id || q.quoteNumber} className="py-3.5 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-ink">{q.quoteNumber}</span>
                      <StatusBadge status={q.status || "submitted"} size="sm" />
                    </div>
                    <p className="text-steel truncate mt-0.5">
                      {q.customer?.companyName || q.customer?.name || "Commercial Client"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold font-mono text-brand block">
                      ₹{(q.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-steel font-mono">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-IN") : "Today"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
