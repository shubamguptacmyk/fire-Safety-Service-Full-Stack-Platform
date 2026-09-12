import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import CTASection from "@/components/ui/CTASection";
import TrustBadge from "@/components/ui/TrustBadge";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  Wrench,
  ArrowRight,
  Phone,
  AlertTriangle,
  Clock,
  Building2,
  FileCheck,
  Award,
} from "lucide-react";
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
        .then((contracts) => setActiveContracts(contracts || []))
        .catch(() => setActiveContracts([]));
    }
  }, [loggedIn]);

  const plans = [
    {
      name: "Essential Safety AMC",
      type: "Non-Comprehensive",
      frequency: "Half-Yearly (2 Visits / Year)",
      idealFor: "Retail Outlets, Small Offices, Clinics & Boutiques",
      price: "₹4,500",
      period: "/ year",
      features: [
        "2 scheduled preventive inspection visits per year",
        "Physical inspection of pressure gauges, nozzles, and tamper seals",
        "Minor valve lubrication and gross weight verification",
        "Form B compliance readiness checklist review",
        "Emergency technician response within 24 hours",
        "Digital maintenance logs stored on customer portal",
      ],
      highlight: false,
    },
    {
      name: "Standard Commercial AMC",
      type: "Quarterly Scheduled",
      frequency: "Quarterly (4 Visits / Year)",
      idealFor: "Housing Societies, Mid-size Corporate Offices, Warehouses",
      price: "₹12,500",
      period: "/ year",
      features: [
        "4 comprehensive quarterly inspection visits per year",
        "Complete testing of portable extinguishers, hose reels & landing valves",
        "Hydrostatic pressure testing verification log maintenance",
        "Annual fire drill & building staff evacuation training",
        "Official Form B Certificate issuance assistance & CFO liaison",
        "Dedicated key account engineer with 4-hour emergency SLA",
      ],
      highlight: true,
    },
    {
      name: "Industrial Comprehensive AMC",
      type: "All-Inclusive Spares & Refills",
      frequency: "Bi-Monthly / Custom",
      idealFor: "Manufacturing Plants, Chemical Warehouses, Data Centers",
      price: "Custom Quote",
      period: "",
      features: [
        "6 to 12 scheduled engineering visits per year",
        "All replacement spares (O-rings, valves, horns, hoses) included",
        "Cylinder refilling & chemical recharges included at zero extra cost",
        "Automatic sprinkler flow rate & FM-200 panel loop diagnostics",
        "Statutory liaison with Maharashtra Fire Services & CFO office",
        "24/7 dedicated rapid emergency dispatch van support",
      ],
      highlight: false,
    },
  ];

  return (
    <>
      <Seo
        title="Annual Maintenance Contracts (AMC) for Fire Safety — Shubam Fire Protection"
        description="Certified quarterly and half-yearly fire safety AMC contracts for societies, corporate offices, and industrial plants across Navi Mumbai & Mumbai MMR."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: "Annual Maintenance Contracts (AMC)" },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <Calendar className="w-3.5 h-3.5" /> Statutory Maharashtra Fire Act Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Annual Maintenance Contracts (AMC)
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Protect your occupants, ensure 100% operational readiness of all firefighting installations, and guarantee compliance with the Maharashtra Fire Prevention & Life Safety Measures Act through certified periodic inspections and Form B certifications.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="primary">
                <Link to="/book-service?type=AMC%20Visit">
                  Schedule AMC Visit <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="white">
                <Link to="/request-quote">Request Society / Commercial Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Credentials */}
      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Active Customer AMC Contracts if Logged In */}
        {activeContracts.length > 0 && (
          <div className="bg-white border-2 border-primary-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Your Active Coverage
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900">
                  Registered Premises AMC Contracts
                </h3>
              </div>
              <Link
                to="/service-history"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View Complete Visit Logbooks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {activeContracts.map((c) => (
                <div
                  key={c._id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5 hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.clientName}</h4>
                      <span className="text-xs text-slate-500 font-mono">Contract: {c.contractNumber}</span>
                    </div>
                    <Badge
                      tone={
                        c.formBStatus === "Current"
                          ? "success"
                          : c.formBStatus === "Due in 30 Days"
                          ? "warning"
                          : "primary"
                      }
                    >
                      Form B: {c.formBStatus}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                    <p>Plan: <strong className="text-slate-900">{c.planName}</strong></p>
                    <p>Location: <span className="text-slate-700">{c.location}</span></p>
                    <p>
                      Visits Completed: <strong className="text-slate-900">{c.visitsCompleted} / {c.visitsPerYear}</strong>
                    </p>
                    <p>
                      Renewal Date:{" "}
                      <strong className="text-primary-700 font-medium">
                        {new Date(c.renewalDate).toLocaleDateString("en-IN")}
                      </strong>
                    </p>
                  </div>

                  <div className="pt-1 flex gap-3">
                    <Button asChild size="sm" variant="primary">
                      <Link to={`/book-service?type=AMC%20Visit&amcId=${c._id}`}>
                        Schedule Next AMC Visit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Contract Packages
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Choose Your Maintenance Coverage
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Transparent packages tailored to your building size, hazard risk profile, and municipal inspection requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl border p-7 sm:p-8 flex flex-col justify-between shadow-sm transition-all duration-300 ${
                  plan.highlight
                    ? "border-primary-600 ring-4 ring-primary-100 shadow-xl relative -translate-y-1"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular for Societies
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block">
                    {plan.type}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-display mt-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {plan.idealFor}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 font-display">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-slate-500 font-medium">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <span className="block text-xs font-semibold text-primary-700 mt-1">
                    {plan.frequency}
                  </span>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Included in Scope:
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-700">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Button
                    asChild
                    variant={plan.highlight ? "primary" : "secondary"}
                    className="w-full"
                  >
                    <Link to={`/book-service?type=AMC%20Visit&plan=${encodeURIComponent(plan.name)}`}>
                      Select Plan & Book Visit <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What is Form B Certification? */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 grid lg:grid-cols-3 gap-8 items-center shadow-xl">
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800">
              <FileCheck className="w-3.5 h-3.5" /> Maharashtra Fire Prevention Act
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Bi-Annual Form B Certificate Issuance
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Under Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act, all commercial
              complexes, hospitals, educational institutions, and residential societies must submit <strong>Form B</strong> every January and July to the Chief Fire Officer (CFO), certifying that all fire fighting installations are in 100% operational condition.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-200 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Authorized Licensed Agency
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Physical inspection & pressure logging
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Municipal notice compliance
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center shadow-lg space-y-3">
            <FileText className="w-10 h-10 text-primary-400 mx-auto" />
            <h4 className="text-base font-bold text-white font-display">Need Form B for your premises?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our licensed engineers can conduct your on-site audit within 48 hours.
            </p>
            <Button asChild variant="primary" className="w-full mt-2">
              <Link to="/book-service?type=Fire%20Safety%20Audit">
                Request Form B Audit
              </Link>
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <CTASection
          title="Looking for a Customized AMC for Multiple Sites?"
          subtitle="Shubam Fire Protection manages unified fire safety AMC contracts for multi-facility corporate campuses, logistics parks, and housing societies across Mumbai MMR."
          primaryBtnText="Request Corporate Proposal"
          primaryBtnLink="/request-quote"
          secondaryBtnText="Speak with AMC Consultant"
          secondaryBtnLink="/contact"
        />
      </main>
    </>
  );
}
