import { apiClient } from "./apiClient";

export interface QuoteItemPayload {
  productId?: string;
  name: string;
  SKU?: string;
  quantity: number;
  specifications?: string;
}

export interface CreateQuotePayload {
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
  items: QuoteItemPayload[];
  requirements: string;
  preferredDate?: string;
}

export interface ApiQuote {
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

export const quoteService = {
  async createQuote(payload: CreateQuotePayload): Promise<ApiQuote> {
    const res = await apiClient.post("/quotes", payload);
    return res.data.data;
  },

  async getMyQuotes(): Promise<ApiQuote[]> {
    const res = await apiClient.get("/quotes/my-quotes");
    return res.data.data;
  },

  async getQuoteById(id: string): Promise<ApiQuote> {
    const res = await apiClient.get(`/quotes/${id}`);
    return res.data.data;
  },

  async downloadQuotePdf(quoteId: string, filename = "quotation.pdf"): Promise<void> {
    const res = await apiClient.get(`/quotes/${quoteId}/pdf`, {
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
