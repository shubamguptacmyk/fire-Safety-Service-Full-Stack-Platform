import { apiClient } from "./apiClient";

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerType?: "Corporate B2B" | "Housing Society" | "Commercial Retail" | "Individual";
  companyName?: string;
  gstNumber?: string;
  tags: string[];
  notes?: string;
  isActive: boolean;
  registeredAt: string;
  totalOrders: number;
  lifetimeSpend: number;
  lastOrderDate?: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
}

export interface Customer360Data {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    customerType?: string;
    companyName?: string;
    gstNumber?: string;
    tags: string[];
    notes?: string;
    isActive: boolean;
    createdAt: string;
  };
  stats: {
    lifetimeSpend: number;
    totalOrders: number;
    paidOrders: number;
    totalQuotes: number;
    activeAMCContracts: number;
    totalServiceBookings: number;
    equipmentCount: number;
    tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  };
  addresses: any[];
  orders: any[];
  quotes: any[];
  amcContracts: any[];
  serviceBookings: any[];
  equipment: any[];
}

export const adminCrmService = {
  async getCustomers(params: {
    search?: string;
    customerType?: string;
    tier?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        customers: CustomerListItem[];
        total: number;
        page: number;
        pages: number;
      };
    }>("/crm/customers", { params });
    return res.data.data;
  },

  async getCustomer360(customerId: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: Customer360Data;
    }>(`/crm/customers/${customerId}`);
    return res.data.data;
  },

  async updateCustomerNotesAndTags(customerId: string, payload: { notes?: string; tags?: string[] }) {
    const res = await apiClient.patch<{
      success: boolean;
      data: { id: string; name: string; notes?: string; tags?: string[] };
    }>(`/crm/customers/${customerId}/notes`, payload);
    return res.data.data;
  },
};
