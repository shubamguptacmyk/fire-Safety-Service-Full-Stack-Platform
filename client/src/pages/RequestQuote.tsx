import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { productService } from "@/services/productService";
import { quoteService } from "@/services/quoteService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import TrustBadge from "@/components/ui/TrustBadge";
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
  AlertCircle,
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
        name: p?.name || "Fire Safety Equipment",
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
        email: email || `${phone}@customer.shubamfire.in`,
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
        const savedQuotes = JSON.parse(
          localStorage.getItem("shubam_customer_quotes") ||
            localStorage.getItem("ak_customer_quotes") ||
            "[]"
        );
        savedQuotes.unshift(quote);
        localStorage.setItem("shubam_customer_quotes", JSON.stringify(savedQuotes));
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
        title="Request Official B2B Fire Safety Quotation — Shubam Fire Protection"
        description="Formal commercial quotation for corporate offices, factories, housing societies, and institutions in Navi Mumbai and Maharashtra."
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "B2B Quotations", href: "/quotes" },
              { label: "Request RFQ" },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-400 font-mono">
              Commercial & Institutional Procurement
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
              Request Official B2B Quotation (RFQ)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Receive a formal GST quotation with volume discount terms, 30-day price lock, and delivery timeline.
            </p>
          </div>
        </div>
      </div>

      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitQuote} className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Company & Contact Details */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-lg text-slate-900 font-display">
                  Company & Project Contact Information
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Company / Organization Legal Entity *"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Reliable Logistics Hub Pvt Ltd"
                />
                <Input
                  label="Representative / Officer Name *"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rajesh Patil (Facility Head)"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="Direct Phone Number *"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                />
                <Input
                  label="Official Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="facility@company.com"
                />
                <Input
                  label="GSTIN Number (for ITC credit)"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="27AAAAA0000A1Z5"
                />
              </div>

              <Input
                label="Site Delivery / Project Location Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot No., Industrial Area / Sector, City"
              />
            </div>

            {/* 2. Items & Equipment List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                    <PackagePlus className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-lg text-slate-900 font-display">
                    Equipment Scope & Quantities
                  </h2>
                </div>
                <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                  {quoteProducts.length} Items Selected
                </span>
              </div>

              {/* Add item selector */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Add From Certified Product Catalog
                </span>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedCatalogId}
                      onChange={(e) => setSelectedCatalogId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-primary-600 outline-none"
                    >
                      <option value="">Select Equipment...</option>
                      {allProducts.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (₹{p.discountPrice || p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      min={1}
                      value={addQty}
                      onChange={(e) => setAddQty(Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-primary-600 outline-none"
                    />
                  </div>

                  <div>
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full"
                      onClick={handleAddProductToQuote}
                      disabled={!selectedCatalogId}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Current Items List */}
              {quoteProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No items added yet. Choose equipment from catalog above or add items from our product pages.
                </div>
              ) : (
                <div className="space-y-3">
                  {quoteProducts.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm"
                    >
                      <div className="space-y-0.5 max-w-[60%]">
                        <strong className="text-slate-900 block font-semibold leading-snug">
                          {item.name}
                        </strong>
                        {item.SKU && (
                          <span className="text-[11px] font-mono text-slate-500 block">
                            SKU: {item.SKU}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-mono">
                          ₹{item.price.toLocaleString("en-IN")} each
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(item.productId, Number(e.target.value))
                            }
                            className="w-14 px-2 py-1 text-xs text-center bg-white border border-slate-200 rounded-lg focus:border-primary-600 outline-none"
                          />
                        </div>

                        <span className="font-mono font-bold text-slate-900 w-24 text-right">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveCustomItem(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Preferred Date & Specific Requirements */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-lg text-slate-900 font-display">
                  Project Timeline & Custom Requirements
                </h2>
              </div>

              <Input
                label="Target Commissioning / Delivery Date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />

              <Textarea
                label="Custom Engineering Requirements / Tender Specifications"
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Mention specific testing requirements (e.g., 35-bar hydro test certificates, Form B readiness, brand preferences, delivery schedule)..."
              />
            </div>
          </div>

          {/* Right Col: Quote Summary Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Commercial Proposal
                </span>
                <h3 className="font-display font-bold text-xl text-slate-900 mt-0.5">
                  Quotation Estimate
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Scope Items:</span>
                  <span className="font-semibold text-slate-900">{quoteProducts.length} Items</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (18%):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{gst.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-primary-700">
                    ₹{estimatedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary-600" /> B2B Price Lock Guarantee
                </span>
                <p>• Locked 30-day fixed pricing upon proposal generation.</p>
                <p>• 100% eligible for Input Tax Credit (ITC) with valid GSTIN.</p>
                <p>• Free technical delivery consultation across Mumbai MMR.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={quoteProducts.length === 0}
              >
                Submit RFQ Proposal <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
