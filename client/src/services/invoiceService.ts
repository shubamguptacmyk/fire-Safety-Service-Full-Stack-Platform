import { apiClient } from "./apiClient";

export interface ApiInvoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  invoiceDate: string;
  customer: {
    name: string;
    companyName?: string;
    gstin?: string;
    phone: string;
    email?: string;
    address: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  items: {
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
  }[];
  totals: {
    taxableAmount: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    grandTotal: number;
  };
  paymentStatus: "unpaid" | "paid" | "partially_paid" | "cancelled";
  createdAt: string;
}

export const invoiceService = {
  async getMyInvoices(): Promise<ApiInvoice[]> {
    const res = await apiClient.get("/invoices/my-invoices");
    return res.data.data;
  },

  async getInvoiceById(id: string): Promise<ApiInvoice> {
    const res = await apiClient.get(`/invoices/${id}`);
    return res.data.data;
  },

  async downloadPdf(invoiceId: string, invoiceNumber = "tax-invoice"): Promise<void> {
    const res = await apiClient.get(`/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
