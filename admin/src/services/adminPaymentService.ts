import { apiClient } from "./apiClient";

export interface AdminPaymentItem {
  _id: string;
  paymentNumber: string;
  orderId?: {
    _id: string;
    orderNumber: string;
    customer?: {
      name: string;
      email: string;
      phone: string;
    };
    pricing?: {
      subtotal: number;
      taxTotal: number;
      grandTotal: number;
    };
    status: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  method: "mock" | "cod" | "razorpay";
  status: "pending" | "success" | "failed" | "refunded";
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export const adminPaymentService = {
  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    search?: string;
  }) {
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        items: AdminPaymentItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/payments", { params });
    return res.data.data;
  },

  async getPaymentById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminPaymentItem;
    }>(`/payments/${id}`);
    return res.data.data;
  },

  async updatePaymentStatus(id: string, status: "pending" | "success" | "failed" | "refunded") {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
      data: AdminPaymentItem;
    }>(`/payments/${id}/status`, { status });
    return res.data.data;
  },
};
