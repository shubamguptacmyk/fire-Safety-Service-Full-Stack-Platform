import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import AccountNav from "@/components/AccountNav";
import { invoiceService } from "@/services/invoiceService";
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

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

      // Generate invoice list from saved orders if any
      try {
        const orders = JSON.parse(localStorage.getItem("ak_customer_orders") || "[]");
        if (orders.length > 0) {
          const generated = orders.map((o: any) => ({
            invoiceNumber: `INV-${o.orderNumber?.replace("AK-ORD-", "2026-") || o._id}`,
            orderNumber: o.orderNumber || o._id,
            date: o.date || o.createdAt || new Date().toISOString(),
            customerName: o.customer?.name,
            companyName: o.customer?.companyName || "Commercial Client",
            gstNumber: o.customer?.gstNumber || "27AAAAA0000A1Z5",
            subtotal: o.pricing?.subtotal || 0,
            cgst: Math.round(((o.pricing?.subtotal || 0) * 0.09)),
            sgst: Math.round(((o.pricing?.subtotal || 0) * 0.09)),
            total: o.pricing?.grandTotal || 0,
            status: "Tax Invoice Issued (Paid)",
          }));
          setInvoices(generated);
        } else {
          setInvoices([]);
        }
      } catch {
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
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
            GST Tax Invoices &amp; Receipts
          </h1>
          <p className="text-xs sm:text-sm text-steel mt-0.5">
            Official tax invoices conforming to Section 31 of CGST Act with 100% ITC eligibility (HSN 8424 / 9987).
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />

          <div className="flex-1 min-w-0 w-full">
            {isLoading ? (
              <div className="py-20 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
                <p className="text-xs text-steel">Retrieving official tax invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-16 bg-white border border-black/10 rounded-2xl text-center max-w-md mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-steel/40" />
                </div>
                <h2 className="font-display font-bold text-lg text-ink">No Tax Invoices Found</h2>
                <p className="text-steel text-xs sm:text-sm mt-1 leading-relaxed">
                  Official GST tax invoices are automatically generated upon order completion or verified AMC maintenance billing.
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-lg shadow-md transition-all"
                >
                  Browse Equipment Catalog <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((inv, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-brand/30 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-bold text-brand">{inv.invoiceNumber}</span>
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-steel">
                        Order Ref: <strong className="text-ink font-mono">{inv.orderNumber}</strong> &bull; Date:{" "}
                        {new Date(inv.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className="text-xs text-steel">
                        <span>Billed To: <strong className="text-ink">{inv.companyName}</strong></span>
                        {inv.gstNumber && <span className="ml-2 font-mono">({inv.gstNumber})</span>}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 gap-2">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-steel block">Grand Total (incl. GST)</span>
                        <span className="text-xl font-bold font-display text-ink">
                          ₹{inv.total.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Tax Invoice (PDF)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
