import { useState, useEffect } from "react";
import Seo from "@/components/Seo";
import { invoiceService } from "@/services/invoiceService";
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const apiInvoices = await invoiceService.getMyInvoices();
        if (apiInvoices && apiInvoices.length > 0) {
          setInvoices(
            apiInvoices.map((inv) => ({
              id: inv._id,
              invoiceNumber: inv.invoiceNumber,
              orderNumber: inv.orderId ? `AK-ORD-${inv.invoiceNumber.slice(-6)}` : "Direct",
              date: inv.invoiceDate || inv.createdAt,
              customerName: inv.customer?.name,
              companyName: inv.customer?.companyName || "Commercial Client",
              gstNumber: inv.customer?.gstin || "27AAAAA0000A1Z5",
              subtotal: inv.totals?.taxableAmount || 0,
              cgst: inv.totals?.cgstTotal || 0,
              sgst: inv.totals?.sgstTotal || 0,
              total: inv.totals?.grandTotal || 0,
              status: `Tax Invoice Issued (${inv.paymentStatus || "Paid"})`,
            }))
          );
          setIsLoading(false);
          return;
        }
      } catch {
        /* guest or fallback */
      }

      // Generate invoice list from saved orders or demo data
      const orders = JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
      if (orders.length > 0) {
        const generated = orders.map((o: any) => ({
          invoiceNumber: `INV-${o.orderNumber.replace("AK-ORD-", "2026-")}`,
          orderNumber: o.orderNumber,
          date: o.date || new Date().toISOString(),
          customerName: o.customer?.name,
          companyName: o.customer?.companyName || "Commercial Client",
          gstNumber: o.customer?.gstNumber || "27AAAAA0000A1Z5",
          subtotal: o.pricing?.subtotal || 8000,
          cgst: Math.round(((o.pricing?.subtotal || 8000) * 0.09)),
          sgst: Math.round(((o.pricing?.subtotal || 8000) * 0.09)),
          total: o.pricing?.grandTotal || 9676,
          status: "Tax Invoice Issued (Paid)",
        }));
        setInvoices(generated);
      } else {
        setInvoices([
          {
            invoiceNumber: "INV-2026-882104",
            orderNumber: "AK-ORD-882104",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            customerName: "Rahul Sharma",
            companyName: "Apex Tech Park Ltd",
            gstNumber: "27AAACA1234F1Z1",
            subtotal: 8200,
            cgst: 738,
            sgst: 738,
            total: 9676,
            status: "Tax Invoice Issued (Paid)",
          },
        ]);
      }
      setIsLoading(false);
    }

    loadInvoices();
  }, []);

  async function handleDownloadInvoice(inv: any) {
    if (inv.id) {
      try {
        await invoiceService.downloadPdf(inv.id, inv.invoiceNumber);
        return;
      } catch {
        /* fallback to window.print */
      }
    }
    window.print();
  }

  return (
    <>
      <Seo
        title="My GST Invoices & Tax Receipts — AK Fire Safety Service"
        description="Download and print GST tax invoices with HSN codes, CGST/SGST breakdowns, and digital compliance stamps."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">Statutory Accounting</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-0.5">
            GST Invoices & Tax Receipts
          </h1>
          <p className="text-xs sm:text-sm text-steel mt-0.5">
            Download compliant tax invoices eligible for Input Tax Credit (ITC) under Section 16 of CGST Act.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          {invoices.map((inv, idx) => (
            <div
              key={idx}
              className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-black/10 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand" />
                    <span className="font-mono text-base font-bold text-ink">{inv.invoiceNumber}</span>
                    <span className="text-[11px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded">
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-steel mt-1">
                    Billed to: <strong>{inv.companyName}</strong> ({inv.customerName}) · GSTIN:{" "}
                    <span className="font-mono text-ink font-semibold">{inv.gstNumber}</span>
                  </p>
                </div>

                <div className="text-right text-xs text-steel">
                  <span>Date: {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <p className="text-[11px]">Ref: {inv.orderNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-paper rounded">
                  <span className="text-steel block text-[10px]">Taxable Value</span>
                  <span className="font-bold text-ink text-sm">₹{inv.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-paper rounded">
                  <span className="text-steel block text-[10px]">CGST (9%)</span>
                  <span className="font-semibold text-ink">₹{inv.cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-paper rounded">
                  <span className="text-steel block text-[10px]">SGST (9%)</span>
                  <span className="font-semibold text-ink">₹{inv.sgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="p-3 bg-paper rounded">
                  <span className="text-steel block text-[10px]">Grand Total (INR)</span>
                  <span className="font-bold text-brand text-sm">₹{inv.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                <span className="text-[11px] text-steel">
                  Supplier GSTIN: 27AABCA9999P1Z3 · HSN Code: 8424 (Fire Extinguishing Apparatus)
                </span>

                <button
                  onClick={() => handleDownloadInvoice(inv)}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Official GST Invoice PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
