import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { quoteService } from "@/services/quoteService";
import { useCartStore } from "@/store/cartStore";
import AccountNav from "@/components/AccountNav";
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
      const saved = JSON.parse(localStorage.getItem("ak_customer_quotes") || "[]");
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
        setQuotes([]);
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
        title="My B2B Quotations & Proposals — AK Fire Safety Service"
        description="Review, download, and manage your commercial fire safety proposals and quotations."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand font-mono">
              Enterprise Accounts
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-0.5">
              B2B Quotations & Proposals
            </h1>
            <p className="text-xs sm:text-sm text-steel mt-0.5">
              Review and approve formal proposals generated for your business or housing society.
            </p>
          </div>
          <Link
            to="/request-quote"
            className="px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber" /> Request New Quotation (RFQ)
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />

          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
          {["All", "Submitted", "Approved", "Converted"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-ink hover:bg-paper border border-black/10"
              }`}
            >
              {st} {st !== "All" && `(${quotes.filter((q) => q.status.includes(st.toUpperCase())).length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
            <p className="text-xs text-steel">Retrieving commercial proposals...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-16 bg-white border border-black/10 rounded-xl text-center max-w-md mx-auto">
            <FileSpreadsheet className="w-12 h-12 text-steel/40 mx-auto mb-3" />
            <h2 className="font-display font-semibold text-lg text-ink">No Active Quotations</h2>
            <p className="text-steel text-xs sm:text-sm mt-1">
              Need bulk fire extinguishers, hydrant systems, or AMC packages?
            </p>
            <Link
              to="/request-quote"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-dark transition-colors"
            >
              Generate B2B Quotation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuotes.map((q, idx) => {
              const isHighlighted = q.quoteNumber === highlightedNumber;
              const isApproved = q.status.includes("APPROVED");

              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-2xl p-6 shadow-sm space-y-4 transition-all ${
                    isHighlighted ? "border-brand ring-2 ring-brand/20" : "border-black/10"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between pb-4 border-b border-black/10 gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-bold text-brand">{q.quoteNumber}</span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isApproved
                              ? "bg-green-100 text-green-800"
                              : q.status.includes("CONVERTED")
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-ink mt-1.5">
                        Client: {q.companyName} {q.customerName && `(${q.customerName})`}
                      </p>
                    </div>

                    <div className="text-right text-xs text-steel">
                      <p>
                        Issued:{" "}
                        {new Date(q.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-red-700 font-semibold mt-0.5">
                        Valid Until:{" "}
                        {new Date(q.validUntil).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Items breakdown table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-paper text-steel border-b border-black/10">
                        <tr>
                          <th className="py-2.5 px-3">Equipment Item</th>
                          <th className="py-2.5 px-3 text-center">Quantity</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Total (Excl. Tax)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {q.items?.map((item: any, i: number) => {
                          const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
                          return (
                            <tr key={i}>
                              <td className="py-2.5 px-3 font-semibold text-ink">
                                {item.name}
                                {item.SKU && <span className="font-mono text-[10px] text-steel block">{item.SKU}</span>}
                              </td>
                              <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-right">
                                ₹{(item.unitPrice || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-ink">
                                ₹{itemTotal.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pricing footer and CTAs */}
                  <div className="pt-4 border-t border-black/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs text-steel">
                      <span>Includes 18% GST (CGST 9% + SGST 9%) for Form B and tax input credit eligibility.</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right pr-2">
                        <span className="text-[10px] text-steel block uppercase tracking-wider">Total Value</span>
                        <span className="text-xl font-bold text-ink font-display">
                          ₹{(q.pricing?.estimatedTotal || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedQuote(q)}
                        className="px-3.5 py-2 border border-black/15 hover:bg-paper text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      <button
                        onClick={() => handleDownloadQuote(q)}
                        disabled={downloadingId === (q.id || q.quoteNumber)}
                        className="px-4 py-2 bg-ink hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        {downloadingId === (q.id || q.quoteNumber) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-amber" />
                        )}
                        Download PDF
                      </button>

                      {isApproved && (
                        <button
                          onClick={() => handleAcceptQuoteAndCheckout(q)}
                          className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Accept & Checkout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>
      </main>

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <span className="font-mono text-sm font-bold text-brand">{selectedQuote.quoteNumber}</span>
                <h3 className="font-display font-bold text-base text-ink">Quotation Specifications</h3>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-steel hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-paper p-3.5 rounded-xl space-y-1.5">
                <p><strong>Company:</strong> {selectedQuote.companyName}</p>
                <p><strong>Contact Person:</strong> {selectedQuote.customerName} ({selectedQuote.phone})</p>
                {selectedQuote.email && <p><strong>Email:</strong> {selectedQuote.email}</p>}
                {selectedQuote.address && <p><strong>Site Address:</strong> {selectedQuote.address}</p>}
                {selectedQuote.requirements && (
                  <p><strong>Special Requirements:</strong> {selectedQuote.requirements}</p>
                )}
              </div>

              <div className="border border-black/10 rounded-xl p-3 space-y-2">
                <h4 className="font-bold text-ink">Line Items Breakdown:</h4>
                <div className="space-y-1.5 divide-y divide-black/5">
                  {selectedQuote.items?.map((item: any, i: number) => (
                    <div key={i} className="pt-1.5 first:pt-0 flex justify-between">
                      <div>
                        <p className="font-semibold text-ink">{item.name}</p>
                        <span className="text-steel text-[11px]">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-bold text-ink">
                        ₹{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-paper p-3.5 rounded-xl space-y-1 text-right">
                <div className="flex justify-between text-steel">
                  <span>Subtotal:</span>
                  <span>₹{selectedQuote.pricing.subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>GST (18%):</span>
                  <span>₹{selectedQuote.pricing.gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-ink text-sm pt-1 border-t border-black/10">
                  <span>Grand Total:</span>
                  <span className="text-brand font-display">
                    ₹{selectedQuote.pricing.estimatedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 border border-black/15 text-ink rounded-lg text-xs font-semibold hover:bg-paper"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadQuote(selectedQuote)}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Proposal PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
