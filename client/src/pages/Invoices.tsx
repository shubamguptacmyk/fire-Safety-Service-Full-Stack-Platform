import { useState, useEffect } from "react";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { invoiceService } from "@/services/invoiceService";
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const apiInvoices = await invoiceService.getMyInvoices();
        if (apiInvoices && apiInvoices.length > 0) {
          setInvoices(
            apiInvoices.map((inv) => ({
              id: inv._id,
              invoiceNumber: inv.invoiceNumber,
              orderNumber: inv.orderId ? `SFP-ORD-${inv.invoiceNumber.slice(-6)}` : "Direct",
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
      const orders = JSON.parse(
        localStorage.getItem("shubam_customer_orders") ||
          localStorage.getItem("ak_customer_orders") ||
          "[]"
      );
      if (orders.length > 0) {
        const generated = orders.map((o: any) => ({
          invoiceNumber: `INV-${o.orderNumber.replace("SFP-ORD-", "2026-").replace("AK-ORD-", "2026-")}`,
          orderNumber: o.orderNumber,
          date: o.date || new Date().toISOString(),
          customerName: o.customer?.name,
          companyName: o.customer?.companyName || "Commercial Client",
          gstNumber: o.customer?.gstNumber || "27AAAAA0000A1Z5",
          subtotal: o.pricing?.subtotal || 8000,
          cgst: Math.round((o.pricing?.subtotal || 8000) * 0.09),
          sgst: Math.round((o.pricing?.subtotal || 8000) * 0.09),
          total: o.pricing?.grandTotal || 9676,
          status: "Tax Invoice Issued (Paid)",
        }));
        setInvoices(generated);
      } else {
        setInvoices([
          {
            invoiceNumber: "INV-2026-882104",
            orderNumber: "SFP-ORD-882104",
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
    setDownloadingId(inv.id || inv.invoiceNumber);
    if (inv.id && !inv.id.startsWith("demo-")) {
      try {
        await invoiceService.downloadPdf(inv.id, inv.invoiceNumber);
        setDownloadingId(null);
        return;
      } catch {
        /* fallback to window.print */
      }
    }
    setDownloadingId(null);
    window.print();
  }

  return (
    <>
      <Seo
        title="My GST Invoices & Tax Receipts — Shubam Fire Protection"
        description="Download and print GST tax invoices with HSN codes, CGST/SGST breakdowns, and digital compliance stamps."
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Account Portal", href: "/profile" },
              { label: "GST Tax Invoices" },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-400 font-mono">
              Statutory Accounting & Tax Invoices
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
              GST Tax Invoices & Payment Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Download compliant tax invoices eligible for Input Tax Credit (ITC) under Section 16 of the CGST Act.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Retrieving official tax invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No tax invoices found"
            description="Your generated GST tax receipts from equipment purchases and service contracts will appear here."
            actionText="Browse Equipment"
            actionLink="/products"
          />
        ) : (
          <div className="space-y-6">
            {invoices.map((inv, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <FileText className="w-5 h-5 text-primary-600 shrink-0" />
                      <span className="font-mono text-base font-extrabold text-slate-900">
                        {inv.invoiceNumber}
                      </span>
                      <Badge tone="success">{inv.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Billed to: <strong className="text-slate-900">{inv.companyName}</strong>{" "}
                      ({inv.customerName}) · GSTIN:{" "}
                      <span className="font-mono text-primary-700 font-semibold">{inv.gstNumber}</span>
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <span>
                      Date:{" "}
                      {new Date(inv.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Order Ref: {inv.orderNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      Taxable Value
                    </span>
                    <span className="font-bold text-slate-900 text-sm font-mono mt-1 block">
                      ₹{inv.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      CGST (9%)
                    </span>
                    <span className="font-semibold text-slate-800 text-sm font-mono mt-1 block">
                      ₹{inv.cgst.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      SGST (9%)
                    </span>
                    <span className="font-semibold text-slate-800 text-sm font-mono mt-1 block">
                      ₹{inv.sgst.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                      Grand Total (INR)
                    </span>
                    <span className="font-extrabold text-primary-700 text-sm font-mono mt-1 block">
                      ₹{inv.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="text-[11px]">
                    Supplier: Shubam Fire Protection · GSTIN: 27AABCA9999P1Z3 · HSN Code: 8424 (Fire Extinguishing Apparatus)
                  </span>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleDownloadInvoice(inv)}
                    isLoading={downloadingId === (inv.id || inv.invoiceNumber)}
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Download Tax Invoice PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
