import { apiClient } from "./apiClient";

export interface AdminInvoiceItem {
  _id: string;
  invoiceNumber: string;
  orderId?: string;
  quoteId?: string;
  invoiceDate: string;
  dueDate?: string;
  customer: {
    name: string;
    companyName?: string;
    gstin?: string;
    phone: string;
    email?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  items: Array<{
    name: string;
    hsnSac: string;
    quantity: number;
    unitPrice: number;
    taxableAmount: number;
    taxRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
  }>;
  totals: {
    taxableAmount: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    grandTotal: number;
    roundOff: number;
  };
  paymentStatus: "unpaid" | "paid" | "partially_paid" | "cancelled";
  createdAt: string;
}

export const adminInvoiceService = {
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    paymentStatus?: string;
  }) {
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: AdminInvoiceItem[];
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>("/invoices", { params });
    return {
      items: res.data.data,
      ...res.data.meta,
    };
  },

  async getInvoiceById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminInvoiceItem;
    }>(`/invoices/${id}`);
    return res.data.data;
  },

  async createInvoice(payload: Partial<AdminInvoiceItem>) {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: AdminInvoiceItem;
    }>("/invoices", payload);
    return res.data.data;
  },

  async downloadInvoicePdf(id: string, invoiceNumber = "invoice") {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
