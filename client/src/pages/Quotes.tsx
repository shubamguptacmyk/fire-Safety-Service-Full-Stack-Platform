import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { quoteService } from "@/services/quoteService";
import { useCartStore } from "@/store/cartStore";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Loader2,
  X,
  FileCheck,
  Building2,
  AlertCircle,
  Eye,
  ShoppingCart,
  Phone,
} from "lucide-react";

export default function Quotes() {
  const [searchParams] = useSearchParams();
  const highlightedNumber = searchParams.get("quoteNumber");
  const navigate = useNavigate();
  const { addItem, clear } = useCartStore();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function loadQuotes() {
    setIsLoading(true);
    try {
      const apiQuotes = await quoteService.getMyQuotes();
      if (apiQuotes && apiQuotes.length > 0) {
        setQuotes(
          apiQuotes.map((q) => ({
            id: q._id,
            quoteNumber: q.quoteNumber,
            date: q.createdAt,
            validUntil: q.validUntil,
            companyName: q.customer?.companyName || "Commercial Client",
            customerName: q.customer?.name,
            phone: q.customer?.phone,
            email: q.customer?.email,
            status: q.status.replace("_", " ").toUpperCase(),
            rawStatus: q.status,
            address: q.customer?.address?.line1 || (q as any).address?.line1,
            requirements: q.requirements,
            pricing: {
              subtotal: q.pricing.subtotal,
              gst: q.pricing.gst,
              estimatedTotal: q.pricing.grandTotal,
            },
            items: q.items,
          }))
        );
        setIsLoading(false);
        return;
      }
    } catch {
      /* guest or fallback */
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem("shubam_customer_quotes") ||
          localStorage.getItem("ak_customer_quotes") ||
          "[]"
      );
      if (saved.length > 0) {
        setQuotes(
          saved.map((q: any) => ({
            id: q._id || q.id,
            quoteNumber: q.quoteNumber,
            date: q.createdAt || q.date || new Date().toISOString(),
            validUntil: q.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
            companyName: q.companyName || q.customer?.companyName || "Commercial Client",
            customerName: q.customerName || q.customer?.name,
            phone: q.phone || q.customer?.phone,
            status: (q.status || "Submitted").replace("_", " ").toUpperCase(),
            rawStatus: q.status || "submitted",
            pricing: {
              subtotal: q.pricing?.subtotal || 0,
              gst: q.pricing?.gst || 0,
              estimatedTotal: q.pricing?.grandTotal || q.pricing?.estimatedTotal || 0,
            },
            items: q.items || [],
          }))
        );
      } else {
        // Sample default quote
        setQuotes([
          {
            id: "demo-q1",
            quoteNumber: "SFP-QUO-742910",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            validUntil: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
            companyName: "Reliable Logistics Hub",
            customerName: "Sanjay Deshmukh",
            phone: "9820098200",
            status: "APPROVED",
            rawStatus: "approved",
            pricing: { subtotal: 34500, gst: 6210, estimatedTotal: 40710 },
            items: [
              {
                name: "SafePro 6kg ABC Stored Pressure Fire Extinguisher (IS 15683)",
                quantity: 10,
                unitPrice: 2850,
                total: 28500,
              },
              {
                name: "Single Landing Valve 63mm Oblique Type (IS 5290)",
                quantity: 2,
                unitPrice: 3000,
                total: 6000,
              },
            ],
          },
        ]);
      }
    } catch {
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  async function handleDownloadQuote(quote: any) {
    setDownloadingId(quote.id || quote.quoteNumber);
    if (quote.id && !quote.id.startsWith("demo-")) {
      try {
        await quoteService.downloadQuotePdf(quote.id, quote.quoteNumber);
        setDownloadingId(null);
        return;
      } catch {
        /* fallback to browser print */
      }
    }
    setDownloadingId(null);
    window.print();
  }

  function handleAcceptQuoteAndCheckout(quote: any) {
    if (!quote.items || quote.items.length === 0) return;
    clear();
    for (const item of quote.items) {
      if (item.productId) {
        addItem(item.productId, item.quantity || 1);
      }
    }
    navigate("/checkout");
  }

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Approved") return q.status.includes("APPROVED");
    if (statusFilter === "Submitted")
      return q.status.includes("SUBMITTED") || q.status.includes("PENDING");
    if (statusFilter === "Converted") return q.status.includes("CONVERTED");
    return true;
  });

  return (
    <>
      <Seo
        title="My B2B Quotations & Proposals — Shubam Fire Protection"
        description="Review, download, and manage your commercial fire safety proposals and quotations."
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Account Portal", href: "/profile" },
              { label: "B2B Quotations" },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400 font-mono">
                Enterprise Accounts
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                B2B Quotations & Proposals
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Review and approve formal GST proposals generated for your business or housing society.
              </p>
            </div>

            <Button asChild variant="primary" size="md">
              <Link to="/request-quote">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Request New Quotation (RFQ)
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {["All", "Submitted", "Approved", "Converted"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {st}{" "}
              {st !== "All" &&
                `(${quotes.filter((q) => q.status.includes(st.toUpperCase())).length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Retrieving commercial proposals...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No active quotations found"
            description="Need bulk fire extinguishers, hydrant equipment, or AMC packages? Request a customized proposal."
            actionText="Generate B2B RFQ"
            actionLink="/request-quote"
          />
        ) : (
          <div className="space-y-6">
            {filteredQuotes.map((q, idx) => {
              const isHighlighted = q.quoteNumber === highlightedNumber;
              const isApproved = q.status.includes("APPROVED");

              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 transition-all ${
                    isHighlighted
                      ? "border-primary-600 ring-2 ring-primary-100"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-base font-extrabold text-primary-700">
                          {q.quoteNumber}
                        </span>
                        <Badge
                          tone={
                            isApproved
                              ? "success"
                              : q.status.includes("CONVERTED")
                              ? "neutral"
                              : "warning"
                          }
                        >
                          {q.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {q.companyName}{" "}
                        {q.customerName && (
                          <span className="text-slate-500 font-normal">
                            (Attn: {q.customerName})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <span>Generated: {new Date(q.date).toLocaleDateString("en-IN")}</span>
                      <span className="block mt-0.5 text-primary-700 font-medium">
                        Valid Until: {new Date(q.validUntil).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Item & Specifications</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4 text-right">Unit Price</th>
                          <th className="py-2.5 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {q.items?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600">
                              ₹{(item.unitPrice || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              ₹{((item.total || item.unitPrice * item.quantity) || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Summary */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Prices include standard 12-month manufacturer warranty.</p>
                      <p>• Quotation valid for 30 days from issuance.</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full sm:w-auto sm:min-w-[240px] space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{q.pricing.subtotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>18% GST (CGST + SGST):</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{q.pricing.gst.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>Grand Total:</span>
                        <span className="font-mono text-primary-700">
                          ₹{q.pricing.estimatedTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownloadQuote(q)}
                      isLoading={downloadingId === (q.id || q.quoteNumber)}
                    >
                      <Download className="w-4 h-4 mr-1.5" /> Download PDF Quote
                    </Button>

                    {isApproved && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAcceptQuoteAndCheckout(q)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1.5" /> Accept Quote & Order
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
