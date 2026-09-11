import { apiClient } from "./apiClient";

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  companyName?: string;
  gstNumber?: string;
}

export interface OrderAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderLineItem {
  productId?: string;
  product?: string;
  name: string;
  SKU?: string;
  price: number;
  quantity: number;
  image?: string;
  capacity?: string;
  fireClass?: string[];
  hsnSac?: string;
}

export interface CreateOrderPayload {
  customer: OrderCustomer;
  items: { productId: string; quantity: number }[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  deliveryMethod?: "standard" | "express" | "pickup";
  paymentMethod?: "mock" | "cod" | "razorpay";
  notes?: string;
}

export interface ApiOrder {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderLineItem[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
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
  statusHistory?: { status: string; changedAt: string; note?: string }[];
  cancellationReason?: string;
  cancelledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<{ order: ApiOrder; invoice?: any; payment: any }> {
    const res = await apiClient.post("/orders", payload);
    return res.data.data;
  },

  async getMyOrders(): Promise<ApiOrder[]> {
    const res = await apiClient.get("/orders/my-orders");
    return res.data.data;
  },

  async getOrderById(id: string): Promise<ApiOrder> {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data.data;
  },

  async cancelOrder(id: string, reason: string): Promise<ApiOrder> {
    const res = await apiClient.post(`/orders/${id}/cancel`, { reason });
    return res.data.data;
  },

  async downloadInvoicePdf(orderId: string, filename = "tax-invoice.pdf"): Promise<void> {
    const res = await apiClient.get(`/orders/${orderId}/invoice`, {
      responseType: "blob",
    });
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
