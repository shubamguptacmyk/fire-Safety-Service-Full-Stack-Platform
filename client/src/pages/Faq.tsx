import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { faqService } from "@/services/faqService";
import Seo from "@/components/Seo";
import { Search, ChevronDown, HelpCircle, Loader2 } from "lucide-react";

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
    a: "Under IS 2190 guidelines, fire extinguishers must be inspected quarterly and refilled after every single discharge or every 1 to 3 years depending on chemical type. Seamless CO2 shells must undergo hydraulic pressure testing every 5 years, while ABC powder shells must be tested every 3 years.",
  },
  {
    category: "AMC & Refilling",
    q: "Do you provide standby loaner extinguishers during refilling?",
    a: "Yes. For societies and industrial clients in Navi Mumbai and Mumbai MMR with 5 or more units, our logistics vans supply temporary loaner extinguishers to ensure your building remains protected during workshop recharge and testing.",
  },
  {
    category: "Form B & Compliance",
    q: "What is Form B and why does my housing society need it?",
    a: "Under the Maharashtra Fire Prevention and Life Safety Measures Act, 2006, all societies and commercial buildings must submit a biannual Form B certificate (in January and July) to the local Chief Fire Officer (CFO). It confirms that all wet risers, pumps, smoke detectors, and extinguishers have been inspected and are 100% operational.",
  },
  {
    category: "Form B & Compliance",
    q: "Can AK Fire Safety issue Form B compliance certificates?",
    a: "Yes. AK Fire Safety is a Licensed Agency registered with Maharashtra Fire Services. Following a thorough inspection and hydrostatic verification, our licensed engineers issue the official Form B certificate required by municipal corporations.",
  },
  {
    category: "Ordering & Billing",
    q: "Can we get GST invoices to claim Input Tax Credit (ITC)?",
    a: "Yes. Every commercial order and service contract generates a standard GST tax invoice displaying our GSTIN, your company name, your GSTIN, HSN/SAC codes, and itemized 18% GST (CGST 9% + SGST 9% or IGST 18%).",
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

  // Normalize API FAQs or fallback
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
        title="Frequently Asked Questions (FAQ) — AK Fire Safety Service"
        description="Clear answers regarding fire extinguisher types, refill timelines, hydrostatic testing norms, and Form B compliance in Maharashtra."
      />

      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">
            Knowledge Base & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Frequently Asked Questions
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-xl leading-relaxed">
            Everything you need to know about fire codes, IS standards, maintenance intervals, and
            statutory compliance under Maharashtra Fire Safety norms.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-lg relative">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, e.g. Form B, CO2, Hydro test, Refill..."
              className="w-full bg-white/10 border border-white/20 focus:border-amber rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/50 outline-none"
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-brand text-white shadow-sm"
                  : "bg-paper text-ink hover:bg-gray-200 border border-black/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand mx-auto" />
            <p className="text-xs text-steel">Retrieving FAQ records...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-black/10 rounded-xl">
            <HelpCircle className="w-10 h-10 text-steel/50 mx-auto mb-2" />
            <p className="font-semibold text-sm text-ink">No matching questions found.</p>
            <p className="text-xs text-steel mt-1">Try another keyword or select &ldquo;All&rdquo;.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndexes.includes(idx);
              return (
                <div
                  key={idx}
                  className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-paper/50 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
                        {faq.category}
                      </span>
                      <h3 className="font-bold text-sm text-ink">{faq.q}</h3>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-steel shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-steel leading-relaxed border-t border-black/5 pt-3 whitespace-pre-line">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
