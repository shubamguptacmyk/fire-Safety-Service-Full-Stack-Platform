import { apiClient } from "./apiClient";

export interface DashboardOverviewData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    paidOrders: number;
    totalCustomers: number;
    newCustomers30d: number;
    activeAMC: number;
    expiringAMC: number;
    totalQuotes: number;
    lowStockCount: number;
  };
  orderStatusCounts: Array<{ _id: string; count: number }>;
  serviceStatusCounts: Array<{ _id: string; count: number }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
    lowStockAlert: number;
  }>;
  recentOrders: any[];
  recentBookings: any[];
  recentQuotes: any[];
  dailyTrend: Array<{ _id: string; revenue: number; orders: number }>;
}

export const adminDashboardService = {
  async getOverview() {
    const res = await apiClient.get<{
      success: boolean;
      data: DashboardOverviewData;
    }>("/dashboard/overview");
    return res.data.data;
  },

  async getRevenueTrends(period = "monthly") {
    const res = await apiClient.get<{
      success: boolean;
      data: any;
    }>("/dashboard/revenue", { params: { period } });
    return res.data.data;
  },
};
