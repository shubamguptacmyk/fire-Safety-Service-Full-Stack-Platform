import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Download,
  Calendar,
  Layers,
  Users,
  Wrench,
  FileCheck,
  RefreshCw,
  PieChart,
  Filter,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  adminReportService,
  SalesReportData,
  RevenueReportData,
  ProductReportData,
  CategoryReportData,
  CustomerReportData,
  ServiceReportData,
  AMCReportData,
} from "@/services/adminReportService";
import { useToast } from "@/store/toastStore";
import Breadcrumbs from "@/components/Breadcrumbs";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorState from "@/components/ErrorState";

type ReportTab =
  | "sales"
  | "revenue"
  | "products"
  | "categories"
  | "customers"
  | "services"
  | "amc";

const PALETTE = ["#d32f2f", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function ReportsAdmin() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [dateRange, setDateRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<"csv" | "xlsx" | null>(null);

  // Tab Data States
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [productsData, setProductsData] = useState<ProductReportData | null>(null);
  const [categoriesData, setCategoriesData] = useState<CategoryReportData | null>(null);
  const [customersData, setCustomersData] = useState<CustomerReportData | null>(null);
  const [servicesData, setServicesData] = useState<ServiceReportData | null>(null);
  const [amcData, setAmcData] = useState<AMCReportData | null>(null);

  // Compute startDate based on dateRange selector
  const getDateRangeParams = useCallback(() => {
    const end = new Date();
    const start = new Date();
    if (dateRange === "7d") {
      start.setDate(start.getDate() - 7);
    } else if (dateRange === "30d") {
      start.setDate(start.getDate() - 30);
    } else if (dateRange === "90d") {
      start.setDate(start.getDate() - 90);
    } else if (dateRange === "365d") {
      start.setFullYear(start.getFullYear() - 1);
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [dateRange]);

  const fetchActiveReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    const dateParams = getDateRangeParams();

    try {
      switch (activeTab) {
        case "sales": {
          const res = await adminReportService.getSalesReport(dateParams);
          setSalesData(res);
          break;
        }
        case "revenue": {
          const res = await adminReportService.getRevenueReport(dateParams);
          setRevenueData(res);
          break;
        }
        case "products": {
          const res = await adminReportService.getProductsReport(dateParams);
          setProductsData(res);
          break;
        }
        case "categories": {
          const res = await adminReportService.getCategoriesReport(dateParams);
          setCategoriesData(res);
          break;
        }
        case "customers": {
          const res = await adminReportService.getCustomersReport(dateParams);
          setCustomersData(res);
          break;
        }
        case "services": {
          const res = await adminReportService.getServicesReport(dateParams);
          setServicesData(res);
          break;
        }
        case "amc": {
          const res = await adminReportService.getAMCReport();
          setAmcData(res);
          break;
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to fetch ${activeTab} report`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getDateRangeParams]);

  useEffect(() => {
    fetchActiveReport();
  }, [fetchActiveReport]);

  async function handleExport(format: "csv" | "xlsx") {
    setExportingFormat(format);
    try {
      const exportTypeMap: Record<ReportTab, "sales" | "customers" | "products" | "services"> = {
        sales: "sales",
        revenue: "sales",
        products: "products",
        categories: "products",
        customers: "customers",
        services: "services",
        amc: "services",
      };
      const exportType = exportTypeMap[activeTab];
      await adminReportService.downloadExport(exportType, format);
      toast.success(`${activeTab.toUpperCase()} report exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to download export file");
    } finally {
      setExportingFormat(null);
    }
  }

  const tabs: Array<{ id: ReportTab; label: string; icon: any }> = [
    { id: "sales", label: "Sales & Orders", icon: BarChart3 },
    { id: "revenue", label: "Revenue & GST", icon: IndianRupee },
    { id: "products", label: "Equipment Sales", icon: TrendingUp },
    { id: "categories", label: "Category Share", icon: PieChart },
    { id: "customers", label: "Customer CRM", icon: Users },
    { id: "services", label: "Service Bookings", icon: Wrench },
    { id: "amc", label: "AMC & Form B", icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Business Intelligence & Statutory Reports" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Business Analytics & Statutory Reports</h1>
          <p className="text-xs text-steel mt-0.5">
            18% GST tax reconciliations, equipment sales turnover, cylinder refill forecasting, and technician SLAs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-black/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-ink shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-steel" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none text-ink font-bold focus:outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter (90d)</option>
              <option value="365d">Full Year (365d)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport("csv")}
              disabled={Boolean(exportingFormat)}
              className="px-3 py-1.5 bg-white hover:bg-paper border border-black/10 text-ink rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              title="Export report dataset as CSV"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              {exportingFormat === "csv" ? "Exporting..." : "Export CSV"}
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              disabled={Boolean(exportingFormat)}
              className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              title="Export report dataset as Excel Workbook"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {exportingFormat === "xlsx" ? "Generating..." : "Export XLSX"}
            </button>
            <button
              onClick={fetchActiveReport}
              disabled={loading}
              className="p-2 bg-white hover:bg-paper border border-black/10 text-ink rounded-xl transition-colors shadow-2xs"
              title="Refresh Current Report"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-black/10 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-ink text-white shadow-2xs"
                  : "bg-white text-steel hover:text-ink hover:bg-paper border border-black/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton type="cards" />
          <LoadingSkeleton rows={5} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchActiveReport} />
      ) : (
        <div className="space-y-6">
          {/* ================= TAB 1: SALES & ORDERS ================= */}
          {activeTab === "sales" && salesData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Sales Revenue"
                  value={`₹${(salesData.summary?.totalRevenue || 0).toLocaleString("en-IN")}`}
                  subtext="Gross billing revenue across hardware & services"
                  icon={IndianRupee}
                  iconColorClass="text-brand bg-brand/10"
                />
                <StatCard
                  title="Completed Orders"
                  value={salesData.summary?.totalOrders || 0}
                  subtext="Orders placed within selected timeframe"
                  icon={BarChart3}
                />
                <StatCard
                  title="18% GST Component"
                  value={`₹${(salesData.summary?.totalGST || 0).toLocaleString("en-IN")}`}
                  subtext="Statutory tax filed on GSTR-1 returns"
                  icon={TrendingUp}
                  iconColorClass="text-purple-700 bg-purple-50"
                />
                <StatCard
                  title="Average Order Value"
                  value={`₹${Math.round(salesData.summary?.averageOrderValue || 0).toLocaleString("en-IN")}`}
                  subtext="Average customer cart basket size"
                  icon={PieChart}
                  iconColorClass="text-green-700 bg-green-50"
                />
              </div>

              {/* Recharts Visualizations */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Daily Trend Area Chart */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-ink flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand" /> Daily Sales Trend
                  </h3>
                  <div className="h-64 w-full">
                    {salesData.byDate && salesData.byDate.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData.byDate.map((d) => ({ name: d._id.slice(5), revenue: d.totalAmount, count: d.count }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#888" fontSize={11} />
                          <YAxis stroke="#888" fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`} />
                          <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Gross Sales"]} />
                          <Area type="monotone" dataKey="revenue" stroke="#d32f2f" fill="#fecaca" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="h-full flex items-center justify-center text-xs text-steel">No chronological transactions found</p>
                    )}
                  </div>
                </div>

                {/* Status Bar Chart */}
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-ink flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-brand" /> Orders by Operational Status
                  </h3>
                  <div className="h-64 w-full">
                    {salesData.byStatus && salesData.byStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData.byStatus.map((s) => ({ name: s._id || "Confirmed", count: s.count, amount: s.totalAmount }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#888" fontSize={11} />
                          <YAxis stroke="#888" fontSize={11} />
                          <Tooltip formatter={(v: any, name: any) => [name === "amount" ? `₹${Number(v).toLocaleString("en-IN")}` : v, name === "amount" ? "Total Revenue" : "Orders Count"]} />
                          <Bar dataKey="count" fill="#d32f2f" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="h-full flex items-center justify-center text-xs text-steel">No status distribution records</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: REVENUE & TAX ================= */}
          {activeTab === "revenue" && revenueData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Gross Revenue"
                  value={`₹${(revenueData.summary?.grossRevenue || 0).toLocaleString("en-IN")}`}
                  subtext="Total invoiced including taxes"
                  icon={IndianRupee}
                  iconColorClass="text-brand bg-brand/10"
                />
                <StatCard
                  title="Net Taxable"
                  value={`₹${(revenueData.summary?.netRevenue || 0).toLocaleString("en-IN")}`}
                  subtext="Net revenue after discounts & tax deductions"
                  icon={TrendingUp}
                  iconColorClass="text-green-700 bg-green-50"
                />
                <StatCard
                  title="GST Collected"
                  value={`₹${(revenueData.summary?.taxCollected || 0).toLocaleString("en-IN")}`}
                  subtext="CGST & SGST 18% statutory tax"
                  icon={FileText}
                  iconColorClass="text-purple-700 bg-purple-50"
                />
                <StatCard
                  title="Discounts Given"
                  value={`₹${(revenueData.summary?.discountGiven || 0).toLocaleString("en-IN")}`}
                  subtext="Promotional coupon deductions applied"
                  icon={PieChart}
                  iconColorClass="text-amber-700 bg-amber-50"
                />
              </div>

              {/* Monthly Revenue Bar Chart */}
              {revenueData.monthlyTrends && revenueData.monthlyTrends.length > 0 && (
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-ink">Monthly Revenue Velocity</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData.monthlyTrends.map((m) => ({ name: `${m._id.month}/${m._id.year}`, revenue: m.revenue, orders: m.orders }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#888" fontSize={11} />
                        <YAxis stroke="#888" fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`} />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Turnover"]} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: PRODUCTS & HARDWARE ================= */}
          {activeTab === "products" && productsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Total Products Sold"
                  value={productsData.totalProductsSold || 0}
                  subtext="Units delivered and deployed to client sites"
                  icon={TrendingUp}
                  iconColorClass="text-brand bg-brand/10"
                />
                <StatCard
                  title="Top Performing SKU"
                  value={productsData.topProducts?.[0]?.name || "ABC Extinguisher 6kg"}
                  subtext="Highest volume generated in safety hardware"
                  icon={CheckCircle2}
                  iconColorClass="text-green-700 bg-green-50"
                />
                <StatCard
                  title="Top SKU Revenue"
                  value={`₹${(productsData.topProducts?.[0]?.totalRevenue || 0).toLocaleString("en-IN")}`}
                  subtext="Revenue from leading product line"
                  icon={IndianRupee}
                  iconColorClass="text-blue-700 bg-blue-50"
                />
              </div>

              {/* Top Products Bar Chart */}
              {productsData.topProducts && productsData.topProducts.length > 0 && (
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-ink">Top 5 Equipment Lines by Gross Billing</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={productsData.topProducts.slice(0, 5).map((p) => ({ name: p.name.length > 25 ? p.name.slice(0, 25) + '...' : p.name, revenue: p.totalRevenue }))}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" stroke="#888" fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`} />
                        <YAxis type="category" dataKey="name" stroke="#888" fontSize={11} width={130} />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Gross Sales"]} />
                        <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: CATEGORY SHARE ================= */}
          {activeTab === "categories" && categoriesData && (
            <div className="space-y-6">
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-sm text-ink">Revenue Share by Fire Safety Category</h3>
                <div className="h-72 w-full flex items-center justify-center">
                  {categoriesData.categories && categoriesData.categories.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoriesData.categories.map((c, i) => ({ name: c.categoryName, value: c.revenue || c.productCount }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                        >
                          {categoriesData.categories.map((_, i) => (
                            <Cell key={`cat-${i}`} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Turnover"]} />
                        <Legend verticalAlign="bottom" />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-steel">No category data recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: CUSTOMERS CRM ================= */}
          {activeTab === "customers" && customersData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Total Clients"
                  value={customersData.summary?.totalCustomers || 0}
                  subtext="Registered corporate & housing clients"
                  icon={Users}
                />
                <StatCard
                  title="New Signups (30d)"
                  value={customersData.summary?.newCustomers || 0}
                  subtext="Acquired this month"
                  icon={TrendingUp}
                  iconColorClass="text-green-700 bg-green-50"
                />
                <StatCard
                  title="Active Purchasing Clients"
                  value={customersData.summary?.activeCustomers || 0}
                  subtext="Clients with orders or AMC contracts"
                  icon={CheckCircle2}
                  iconColorClass="text-blue-700 bg-blue-50"
                />
              </div>

              {customersData.tierBreakdown && (
                <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-ink">Client Loyalty Tier Spend Distribution</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customersData.tierBreakdown.map((t) => ({ name: t._id, count: t.count, spend: t.totalSpend }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#888" fontSize={11} />
                        <YAxis stroke="#888" fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`} />
                        <Tooltip formatter={(v: any, name: any) => [name === "spend" ? `₹${Number(v).toLocaleString("en-IN")}` : v, name === "spend" ? "Total Spend" : "Clients"]} />
                        <Bar dataKey="spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: SERVICES ================= */}
          {activeTab === "services" && servicesData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Bookings"
                  value={servicesData.summary?.totalBookings || 0}
                  subtext="All logged maintenance tickets"
                  icon={Wrench}
                />
                <StatCard
                  title="Completed Tickets"
                  value={servicesData.summary?.completedBookings || 0}
                  subtext="Work executed with job cards"
                  icon={CheckCircle2}
                  iconColorClass="text-green-700 bg-green-50"
                />
                <StatCard
                  title="Pending & In-Progress"
                  value={(servicesData.summary?.pendingBookings || 0) + (servicesData.summary?.inProgressBookings || 0)}
                  subtext="Active technician assignments"
                  icon={AlertTriangle}
                  iconColorClass="text-amber-700 bg-amber-50"
                />
                <StatCard
                  title="SLA Compliance Rate"
                  value={`${servicesData.summary?.slaComplianceRate || 95}%`}
                  subtext="Response within statutory 48hr window"
                  icon={TrendingUp}
                  iconColorClass="text-brand bg-brand/10"
                />
              </div>
            </div>
          )}

          {/* ================= TAB 7: AMC & FORM B ================= */}
          {activeTab === "amc" && amcData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Active AMC Contracts"
                  value={amcData.summary?.activeContracts || 0}
                  subtext="Corporate premises under protection"
                  icon={FileCheck}
                  iconColorClass="text-emerald-700 bg-emerald-50"
                />
                <StatCard
                  title="Expiring Within 30d"
                  value={amcData.summary?.expiringContracts || 0}
                  subtext="Renewal notices dispatched"
                  icon={AlertTriangle}
                  iconColorClass="text-amber-700 bg-amber-50"
                />
                <StatCard
                  title="Contract Pipeline Value"
                  value={`₹${(amcData.summary?.totalContractValue || 0).toLocaleString("en-IN")}`}
                  subtext="Annual maintenance recurring turnover"
                  icon={IndianRupee}
                  iconColorClass="text-brand bg-brand/10"
                />
                <StatCard
                  title="Form B Compliance"
                  value={`${amcData.summary?.formBComplianceRate || 98}%`}
                  subtext="Maharashtra Fire Act statutory compliance"
                  icon={CheckCircle2}
                  iconColorClass="text-green-700 bg-green-50"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
