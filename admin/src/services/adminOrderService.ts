import { apiClient } from "./apiClient";

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    companyName?: string;
    gstNumber?: string;
  };
  items: {
    product: string;
    name: string;
    SKU?: string;
    price: number;
    quantity: number;
    capacity?: string;
  }[];
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    gst: number;
    shippingFee: number;
    grandTotal: number;
  };
  deliveryMethod: string;
  deliveryDetails?: {
    carrier?: string;
    lrNumber?: string;
    estimatedDelivery?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "Pending" | "Confirmed" | "Processing" | "Packed" | "Dispatched" | "Delivered" | "Cancelled" | "Refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const adminOrderService = {
  async listOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<{ orders: AdminOrder[]; meta: any }> {
    const res = await apiClient.get("/orders/admin", { params });
    return {
      orders: res.data.data,
      meta: res.data.meta,
    };
  },

  async getOrderById(id: string): Promise<AdminOrder> {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data.data;
  },

  async updateOrderStatus(
    id: string,
    payload: {
      status: string;
      note?: string;
      deliveryDetails?: { carrier?: string; lrNumber?: string; estimatedDelivery?: string };
    }
  ): Promise<AdminOrder> {
    const res = await apiClient.patch(`/orders/${id}/status`, payload);
    return res.data.data;
  },

  async downloadInvoice(id: string, filename = "tax-invoice.pdf"): Promise<void> {
    const res = await apiClient.get(`/orders/${id}/invoice`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
