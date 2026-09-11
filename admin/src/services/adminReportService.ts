import { apiClient } from "./apiClient";

export interface SalesReportData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalGST: number;
    averageOrderValue: number;
  };
  byStatus: Array<{ _id: string; count: number; totalAmount: number }>;
  byDate: Array<{ _id: string; count: number; totalAmount: number }>;
}

export interface RevenueReportData {
  summary: {
    grossRevenue: number;
    netRevenue: number;
    taxCollected: number;
    shippingCollected: number;
    discountGiven: number;
  };
  monthlyTrends: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
}

export interface ProductReportData {
  topProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  totalProductsSold: number;
}

export interface CategoryReportData {
  categories: Array<{
    _id: string;
    categoryName: string;
    productCount: number;
    revenue: number;
  }>;
}

export interface CustomerReportData {
  summary: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
  };
  tierBreakdown: Array<{ _id: string; count: number; totalSpend: number }>;
}

export interface ServiceReportData {
  summary: {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    inProgressBookings: number;
    slaComplianceRate: number;
  };
  byType: Array<{ _id: string; count: number }>;
}

export interface AMCReportData {
  summary: {
    activeContracts: number;
    expiringContracts: number;
    expiredContracts: number;
    totalContractValue: number;
    formBComplianceRate: number;
  };
  contractsByQuarter: Array<{ _id: string; count: number; value: number }>;
}

export const adminReportService = {
  async getSalesReport(params?: { startDate?: string; endDate?: string; status?: string }) {
    const res = await apiClient.get<{ success: boolean; data: SalesReportData }>("/reports/sales", {
      params,
    });
    return res.data.data;
  },

  async getRevenueReport(params?: { startDate?: string; endDate?: string }) {
    const res = await apiClient.get<{ success: boolean; data: RevenueReportData }>("/reports/revenue", {
      params,
    });
    return res.data.data;
  },

  async getProductsReport(params?: { startDate?: string; endDate?: string }) {
    const res = await apiClient.get<{ success: boolean; data: ProductReportData }>("/reports/products", {
      params,
    });
    return res.data.data;
  },

  async getCategoriesReport(params?: { startDate?: string; endDate?: string }) {
    const res = await apiClient.get<{ success: boolean; data: CategoryReportData }>("/reports/categories", {
      params,
    });
    return res.data.data;
  },

  async getCustomersReport(params?: { startDate?: string; endDate?: string }) {
    const res = await apiClient.get<{ success: boolean; data: CustomerReportData }>("/reports/customers", {
      params,
    });
    return res.data.data;
  },

  async getServicesReport(params?: { startDate?: string; endDate?: string }) {
    const res = await apiClient.get<{ success: boolean; data: ServiceReportData }>("/reports/services", {
      params,
    });
    return res.data.data;
  },

  async getAMCReport() {
    const res = await apiClient.get<{ success: boolean; data: AMCReportData }>("/reports/amc");
    return res.data.data;
  },

  async downloadExport(
    type: "sales" | "customers" | "products" | "services",
    format: "csv" | "xlsx" = "xlsx"
  ) {
    const response = await apiClient.get(`/reports/${type}/export`, {
      params: { format },
      responseType: "blob",
    });
    const mimeType =
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}_report_${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
