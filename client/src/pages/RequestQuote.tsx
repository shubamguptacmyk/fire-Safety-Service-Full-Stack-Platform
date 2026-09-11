import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { productService } from "@/services/productService";
import { quoteService } from "@/services/quoteService";
import Seo from "@/components/Seo";
import {
  FileSpreadsheet,
  Building2,
  Phone,
  Mail,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  PackagePlus,
  Loader2,
} from "lucide-react";
import { Product } from "@/types";

interface RfqLineItem {
  productId: string;
  name: string;
  SKU?: string;
  price: number;
  quantity: number;
}

export default function RequestQuote() {
  const navigate = useNavigate();
  const { lines, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || "");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Additional products builder state
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");
  const [addQty, setAddQty] = useState<number>(5);

  // Fetch full product catalog for quotation item selector
  const { data: catalogData } = useQuery({
    queryKey: ["all-products-for-quote"],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });

  const allProducts: Product[] = catalogData?.products || [];

  // Local quote items initialized from cart lines or empty
  const [customItems, setCustomItems] = useState<RfqLineItem[]>(() => {
    return [];
  });

  // Merge cart items with custom added items
  const quoteProducts: RfqLineItem[] = [
    ...lines.map((line) => {
      const p = allProducts.find((prod) => prod._id === line.productId);
      return {
        productId: line.productId,
        name: p?.name || "Fire Equipment",
        SKU: p?.SKU,
        price: p ? p.discountPrice || p.price : 0,
        quantity: line.quantity,
      };
    }),
    ...customItems,
  ];

  function handleAddProductToQuote() {
    if (!selectedCatalogId) return;
    const prod = allProducts.find((p) => p._id === selectedCatalogId);
    if (!prod) return;

    // Check if already in items
    const existingIndex = customItems.findIndex((i) => i.productId === prod._id);
    if (existingIndex >= 0) {
      const updated = [...customItems];
      updated[existingIndex].quantity += addQty;
      setCustomItems(updated);
    } else {
      setCustomItems([
        ...customItems,
        {
          productId: prod._id,
          name: prod.name,
          SKU: prod.SKU,
          price: prod.discountPrice || prod.price,
          quantity: Math.max(1, addQty),
        },
      ]);
    }
    setSelectedCatalogId("");
    setAddQty(5);
  }

  function handleRemoveCustomItem(productId: string) {
    setCustomItems(customItems.filter((i) => i.productId !== productId));
  }

  function handleUpdateQuantity(productId: string, newQty: number) {
    if (newQty <= 0) return;
    setCustomItems(
      customItems.map((i) => (i.productId === productId ? { ...i, quantity: newQty } : i))
    );
  }

  const subtotal = quoteProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const estimatedTotal = subtotal + gst;

  async function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !companyName || !phone) {
      setErrorMsg("Please fill in all required company and contact fields.");
      return;
    }

    if (quoteProducts.length === 0) {
      setErrorMsg("Please add at least one piece of equipment to your quotation request.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const quote = await quoteService.createQuote({
        name: customerName,
        companyName,
        phone,
        email: email || `${phone}@customer.akfiresafety.com`,
        gstNumber: gstNumber || undefined,
        address: { line1: address },
        requirements,
        preferredDate: preferredDate || undefined,
        items: quoteProducts.map((p) => ({
          productId: p.productId,
          name: p.name,
          SKU: p.SKU,
          quantity: p.quantity,
          unitPrice: p.price,
        })),
      });

      // Keep backup in localStorage
      try {
        const savedQuotes = JSON.parse(localStorage.getItem("ak_customer_quotes") || "[]");
        savedQuotes.unshift(quote);
        localStorage.setItem("ak_customer_quotes", JSON.stringify(savedQuotes));
      } catch {
        /* ignore */
      }

      clear();
      navigate(`/quotes?quoteNumber=${quote.quoteNumber}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Request Official B2B Fire Safety Quotation — AK Fire Safety"
        description="Formal commercial quotation for corporate offices, factories, societies, and institutions in Navi Mumbai and Maharashtra."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand font-mono">
            Commercial & Institutional Procurement
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-0.5">
            Request Official B2B Quotation (RFQ)
          </h1>
          <p className="text-xs sm:text-sm text-steel mt-1">
            Receive a formal GST quotation with volume discount terms, 30-day price lock, and delivery timeline.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitQuote} className="grid lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-ink flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand" /> Company & Project Contact
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Reliance Corporate Park / Lodha Society"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rajesh Patil (Facility Manager)"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Direct Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Company GSTIN</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs uppercase focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">
                  Facility / Installation Site Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="MIDC Turbhe / Sector 15, Belapur, Navi Mumbai"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Target Installation / Supply Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Specific Requirements / Compliance Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="e.g. Require half-yearly Form B certificate, wall brackets, and staff training demo..."
                    className="w-full px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Product Selector Builder */}
            <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-brand" /> Add Equipment to Quotation Tray
                </h3>
                <span className="text-xs text-steel">Select from our certified catalog</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCatalogId}
                  onChange={(e) => setSelectedCatalogId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none bg-white truncate"
                >
                  <option value="">-- Choose Fire Safety Equipment / Extinguisher --</option>
                  {allProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.SKU || p.brand}) — ₹{(p.discountPrice || p.price).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={addQty}
                    onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none text-center"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={handleAddProductToQuote}
                    disabled={!selectedCatalogId}
                    className="px-4 py-2 bg-ink hover:bg-black disabled:opacity-40 text-white rounded text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Quote Items & Summary */}
          <div className="space-y-4">
            <div className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-ink pb-3 border-b border-black/10 flex items-center justify-between">
                <span>Selected Equipment</span>
                <span className="text-xs text-steel font-normal">({quoteProducts.length} items)</span>
              </h3>

              {quoteProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-steel space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-steel/40 mx-auto" />
                  <p>No equipment currently added to quotation tray.</p>
                  <p className="text-brand font-semibold">
                    Use the product selector on the left or browse our catalog.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {quoteProducts.map((p) => (
                    <div
                      key={p.productId}
                      className="flex justify-between items-start text-xs py-2 border-b border-black/5 gap-2"
                    >
                      <div className="truncate flex-1">
                        <p className="font-semibold text-ink truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-steel">
                          <span>Qty: {p.quantity}</span>
                          <span>•</span>
                          <span>₹{p.price.toLocaleString("en-IN")} each</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-ink block">
                          ₹{(p.price * p.quantity).toLocaleString("en-IN")}
                        </span>
                        {customItems.some((c) => c.productId === p.productId) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomItem(p.productId)}
                            className="text-[10px] text-red-600 hover:underline mt-0.5 inline-flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 text-xs pt-3 border-t border-black/10">
                <div className="flex justify-between text-steel">
                  <span>Base Equipment Value</span>
                  <span className="text-ink font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Estimated GST (18%)</span>
                  <span className="text-ink font-medium">₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-3 border-t border-black/10 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-ink">Estimated Quote Value</span>
                    <p className="text-[10px] text-steel">Subject to volume discounting</p>
                  </div>
                  <span className="text-xl font-bold text-ink font-display">
                    ₹{estimatedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || quoteProducts.length === 0}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating Official RFQ...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 text-amber" /> Generate Official B2B Quote
                  </>
                )}
              </button>

              <div className="p-3 bg-paper rounded border border-black/10 text-[11px] text-steel space-y-1">
                <p className="flex items-center gap-1.5 text-ink font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand" /> Formal Quotation Guarantee:
                </p>
                <p>• Prices locked for 30 calendar days</p>
                <p>• GST tax invoice provided with input credit eligibility</p>
                <p>• Dedicated technical sales representative assigned within 2 hours</p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
