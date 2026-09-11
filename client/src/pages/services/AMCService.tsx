import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { ShieldCheck, CheckCircle2, Calendar, FileText, Wrench, ArrowRight, Phone, AlertTriangle, Clock } from "lucide-react";
import { amcService, ApiAMCContract } from "@/services/amcService";
import { useAuthStore } from "@/store/authStore";

export default function AMCService() {
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();
  const [activeContracts, setActiveContracts] = useState<ApiAMCContract[]>([]);

  useEffect(() => {
    if (loggedIn) {
      amcService
        .getMyAMCContracts()
        .then((contracts) => setActiveContracts(contracts))
        .catch(() => setActiveContracts([]));
    }
  }, [loggedIn]);

  const plans = [
    {
      name: "Essential Safety AMC",
      type: "Non-Comprehensive",
      frequency: "Half-Yearly (2 Visits / Year)",
      idealFor: "Retail Shops, Small Offices, Clinics & Boutiques",
      price: "From ₹4,500 / Year",
      features: [
        "2 scheduled preventative inspection visits per year",
        "Physical inspection of pressure gauges, nozzles, and seals",
        "Minor valve greasing and weight verification",
        "Form B compliance readiness review",
        "Priority emergency technician support",
      ],
      highlight: false,
    },
    {
      name: "Standard Commercial AMC",
      type: "Quarterly Scheduled",
      frequency: "Quarterly (4 Visits / Year)",
      idealFor: "Housing Societies, Mid-size Corporate Offices, Warehouses",
      price: "From ₹12,500 / Year",
      features: [
        "4 comprehensive inspection visits per year",
        "Full testing of extinguishers, hose reels, and landing valves",
        "Hydrostatic pressure testing verification log",
        "Annual fire drill and staff evacuation training session",
        "Official Form B Certificate issuance assistance",
        "Dedicated account manager & 4-hour emergency SLA",
      ],
      highlight: true,
    },
    {
      name: "Industrial Comprehensive AMC",
      type: "All-Inclusive Spares & Refills",
      frequency: "Bi-Monthly / Quarterly",
      idealFor: "Manufacturing Plants, Chemical Warehouses, Data Centers",
      price: "Custom Industrial Quote",
      features: [
        "6 to 12 visits per year with automated logbook records",
        "All replacement spares (O-rings, valves, horns, pipes) included",
        "Gas refilling and chemical refills included at zero extra cost",
        "FM-200 and suppression panel loop diagnostics",
        "Full statutory liaison with Maharashtra Fire Services",
      ],
      highlight: false,
    },
  ];

  return (
    <>
      <Seo
        title="Annual Maintenance Contracts (AMC) for Fire Safety — AK Fire Safety"
        description="Certified quarterly and half-yearly fire safety AMC contracts for societies, offices, and industrial plants in Navi Mumbai and Mumbai MMR."
      />

      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">Statutory Fire Compliance</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Annual Maintenance Contracts (AMC)
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-2xl leading-relaxed">
            Protect your occupants and satisfy Maharashtra Fire Prevention & Life Safety Measures Act
            requirements with certified technician visits, logbook upkeep, and Form B compliance certification.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Active Customer AMC Contracts if Logged In */}
        {activeContracts.length > 0 && (
          <div className="bg-white border-2 border-brand/20 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">Your Active Coverage</span>
                <h3 className="text-lg font-display font-bold text-ink">Registered Premises AMC Contracts</h3>
              </div>
              <Link
                to="/service-history"
                className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
              >
                View Visit Logbooks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {activeContracts.map((c) => (
                <div key={c._id} className="p-4 bg-paper rounded-xl border border-black/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-ink text-sm">{c.clientName}</h4>
                      <span className="text-xs text-steel font-mono">Contract: {c.contractNumber}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        c.formBStatus === "Current"
                          ? "bg-green-100 text-green-800"
                          : c.formBStatus === "Due in 30 Days"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      Form B: {c.formBStatus}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-steel">
                    <p>Plan: <strong className="text-ink">{c.planName}</strong></p>
                    <p>Location: {c.location}</p>
                    <p>
                      Visits Completed: <strong className="text-ink">{c.visitsCompleted} / {c.visitsPerYear}</strong>
                    </p>
                    <p>
                      Renewal Date: <strong className="text-brand">{new Date(c.renewalDate).toLocaleDateString("en-IN")}</strong>
                    </p>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Link
                      to={`/book-service?type=AMC%20Visit&amcId=${c._id}`}
                      className="px-3 py-1.5 bg-brand text-white rounded text-xs font-semibold hover:bg-brand-dark transition-colors"
                    >
                      Schedule Next AMC Visit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-2xl font-bold text-ink">Choose Your Maintenance Coverage</h2>
            <p className="text-steel text-xs sm:text-sm mt-1">
              Transparent packages tailored to your building size and regulatory audit requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                  plan.highlight
                    ? "border-brand ring-2 ring-brand/20 shadow-md relative"
                    : "border-black/10 hover:border-black/30"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand block">{plan.type}</span>
                  <h3 className="text-lg font-bold text-ink font-display mt-0.5">{plan.name}</h3>
                  <p className="text-xs text-steel mt-1">{plan.idealFor}</p>

                  <div className="mt-4 pt-4 border-t border-black/10">
                    <span className="text-xl font-bold text-ink font-display">{plan.price}</span>
                    <span className="block text-[11px] text-steel mt-0.5">{plan.frequency}</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-ink/90">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-black/10">
                  <Link
                    to={`/book-service?type=AMC%20Visit&plan=${encodeURIComponent(plan.name)}`}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      plan.highlight
                        ? "bg-brand hover:bg-brand-dark text-white"
                        : "bg-paper hover:bg-gray-200 text-ink border border-black/10"
                    }`}
                  >
                    Select Plan & Schedule Visit <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What is Form B Certification? */}
        <div className="bg-paper border border-black/10 rounded-xl p-8 grid sm:grid-cols-3 gap-8 items-center">
          <div className="sm:col-span-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Maharashtra Fire Act Mandate</span>
            <h3 className="text-xl font-display font-bold text-ink">
              Bi-Annual Form B Certificate Issuance
            </h3>
            <p className="text-xs sm:text-sm text-steel leading-relaxed">
              Under Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act, all commercial
              buildings and housing societies must submit <strong>Form B</strong> every January and July to the
              Chief Fire Officer (CFO), certifying that all fire fighting installations are in pristine operating condition.
            </p>
            <p className="text-xs text-ink font-semibold">
              ✓ AK Fire Safety is a Licensed Agency authorized to inspect, test, and issue official Form B certificates.
            </p>
          </div>

          <div className="bg-white border border-black/10 rounded-lg p-5 text-center shadow-sm">
            <FileText className="w-10 h-10 text-brand mx-auto mb-2" />
            <span className="text-xs font-bold text-ink block">Need Form B for your premises?</span>
            <p className="text-[11px] text-steel mt-1">Book an audit inspection this week.</p>
            <Link
              to="/book-service?type=Fire%20Safety%20Audit"
              className="mt-3 inline-block px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-dark"
            >
              Request Form B Audit
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
