import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { faqService } from "@/services/faqService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import TrustBadge from "@/components/ui/TrustBadge";
import { Search, ChevronDown, HelpCircle, Loader2, ArrowRight, MessageSquare, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FALLBACK_FAQS: FaqItem[] = [
  {
    category: "General & Products",
    q: "What is an ABC Dry Powder fire extinguisher and where should it be used?",
    a: "An ABC Dry Powder extinguisher is filled with Mono-Ammonium Phosphate (MAP 50%) and pressurized with dry nitrogen. It is versatile and effective on Class A fires (wood, paper, textiles), Class B fires (petrol, diesel, oils), Class C fires (flammable gases), and electrically energized equipment.",
  },
  {
    category: "General & Products",
    q: "Are all your extinguishers certified by the Bureau of Indian Standards (BIS)?",
    a: "Yes. All our portable and trolley-mounted fire extinguishers carry legitimate ISI marks and conform to IS 15683:2018 (portable type), IS 2878 (CO2 type), or IS 10204 (foam type). Each unit is delivered with a factory hydrostatic test certificate.",
  },
  {
    category: "General & Products",
    q: "What extinguisher should I install in my IT server room?",
    a: "For server rooms, telecom shelters, and computer labs, Clean Agent (FE-36 / HFC-236fa) or Carbon Dioxide (CO2) extinguishers must be used. Unlike dry powder, clean agents and CO2 leave zero chemical dust or corrosive residue on delicate electronic circuit boards.",
  },
  {
    category: "AMC & Refilling",
    q: "How frequently must fire extinguishers be refilled and tested?",
    a: "Under IS 2190 guidelines, fire extinguishers must be inspected quarterly and refilled after every single discharge or every 1 to 3 years depending on chemical type. Seamless CO2 shells must undergo hydraulic pressure testing every 5 years, while ABC powder shells must be tested every 3 years at 35 bar.",
  },
  {
    category: "AMC & Refilling",
    q: "Do you provide standby loaner extinguishers during refilling?",
    a: "Yes. For housing societies and commercial facilities in Navi Mumbai and Mumbai MMR with 5 or more units, our logistics vans supply temporary loaner standby extinguishers to ensure your building remains protected during workshop recharge and pressure testing.",
  },
  {
    category: "Form B & Compliance",
    q: "What is Form B and why does my housing society need it?",
    a: "Under the Maharashtra Fire Prevention and Life Safety Measures Act, 2006, all residential societies and commercial buildings must submit a biannual Form B certificate (in January and July) to the local Chief Fire Officer (CFO). It confirms that all wet risers, pumps, smoke detectors, and extinguishers have been inspected and are 100% operational.",
  },
  {
    category: "Form B & Compliance",
    q: "Can Shubam Fire Protection issue Form B compliance certificates?",
    a: "Yes. Shubam Fire Protection is an authorized Licensed Agency registered with Maharashtra Fire Services. Following a thorough on-site inspection and hydrostatic verification, our licensed engineers issue the official Form B certificate required by municipal corporations.",
  },
  {
    category: "Ordering & Billing",
    q: "Can we get GST invoices to claim Input Tax Credit (ITC)?",
    a: "Yes. Every commercial order and service contract generates a standard GST tax invoice displaying our GSTIN, your company legal name, your GSTIN, HSN/SAC codes, and itemized 18% GST (CGST 9% + SGST 9% or IGST 18%).",
  },
  {
    category: "Ordering & Billing",
    q: "How does the B2B Quotation request process work?",
    a: "Select your desired items in the catalog, switch your tray to 'B2B Quotation Mode', and fill in your company and GST details. Our system instantly generates an official quote number with locked 30-day pricing and a technical sales representative reaches out to customize bulk volume discounts.",
  },
];

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openIndexes, setOpenIndexes] = useState<number[]>([0, 1]);

  const categories = [
    "All",
    "General & Products",
    "AMC & Refilling",
    "Form B & Compliance",
    "Ordering & Billing",
  ];

  const { data: apiFaqs = [], isLoading } = useQuery({
    queryKey: ["public-faqs", selectedCategory],
    queryFn: () => faqService.getPublicFaqs(selectedCategory === "All" ? undefined : selectedCategory),
  });

  const items: FaqItem[] =
    apiFaqs.length > 0
      ? apiFaqs.map((f) => ({
          q: f.question,
          a: f.answer,
          category: f.category,
        }))
      : FALLBACK_FAQS;

  const filteredFaqs = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function toggleFaq(index: number) {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  }

  return (
    <>
      <Seo
        title="Frequently Asked Questions (FAQ) — Shubam Fire Protection"
        description="Clear answers on BIS fire extinguisher standards, IS 2190 refilling intervals, Form B Maharashtra Fire Act compliance, and B2B ordering."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Frequently Asked Questions" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <HelpCircle className="w-3.5 h-3.5" /> Technical Knowledge & Statutory Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Find technical answers about fire equipment specifications, cylinder refilling protocols, Maharashtra Form B legal mandates, and commercial procurement.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadge />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {/* Search & Categories Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic (e.g. Form B, Hydro test, Refilling, ABC Powder)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-2xl focus:border-primary-600 outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading technical answers...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base font-display">No questions match your search</h3>
            <p className="text-xs text-slate-500 mt-1">Try another keyword or reach out directly to our engineering desk.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndexes.includes(idx);
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-primary-700 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      <p className="pt-2">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Questions Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider text-primary-400 font-mono font-bold">
              Engineering Support Desk
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Still Have Technical or Statutory Compliance Questions?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Speak directly with our licensed fire protection consultants in Navi Mumbai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button asChild variant="primary" size="md">
              <Link to="/contact">Contact Our Team</Link>
            </Button>
            <a
              href="tel:+919800000000"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-slate-700"
            >
              <PhoneCall className="w-4 h-4 text-primary-400" /> +91 98000 00000
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
