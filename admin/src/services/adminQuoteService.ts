import { apiClient } from "./apiClient";

export interface AdminQuote {
  _id: string;
  quoteNumber: string;
  customer: {
    name: string;
    companyName: string;
    phone: string;
    email: string;
    gstNumber?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  };
  items: {
    product?: string;
    name: string;
    SKU?: string;
    quantity: number;
    unitPrice: number;
    gstPercent: number;
    total: number;
    specifications?: string;
  }[];
  pricing: {
    subtotal: number;
    gst: number;
    grandTotal: number;
  };
  requirements: string;
  preferredDate?: string;
  validUntil: string;
  terms: string[];
  status: "submitted" | "under_review" | "proposal_sent" | "approved" | "rejected" | "converted";
  convertedOrderId?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const adminQuoteService = {
  async listQuotes(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ quotes: AdminQuote[]; meta: any }> {
    const res = await apiClient.get("/quotes/admin", { params });
    return {
      quotes: res.data.data,
      meta: res.data.meta,
    };
  },

  async getQuoteById(id: string): Promise<AdminQuote> {
    const res = await apiClient.get(`/quotes/${id}`);
    return res.data.data;
  },

  async updateQuote(
    id: string,
    payload: {
      status: string;
      adminNotes?: string;
      items?: any[];
      pricing?: { subtotal: number; gst: number; grandTotal: number };
      validUntil?: string;
    }
  ): Promise<AdminQuote> {
    const res = await apiClient.put(`/quotes/${id}`, payload);
    return res.data.data;
  },

  async convertQuoteToOrder(id: string): Promise<{ quote: AdminQuote; order: any }> {
    const res = await apiClient.post(`/quotes/${id}/convert`);
    return res.data.data;
  },

  async downloadQuotePdf(id: string, filename = "quotation.pdf"): Promise<void> {
    const res = await apiClient.get(`/quotes/${id}/pdf`, { responseType: "blob" });
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
