import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import CTASection from "@/components/ui/CTASection";
import TrustBadge from "@/components/ui/TrustBadge";
import {
  ShieldCheck,
  Building2,
  Award,
  Users,
  CheckCircle2,
  Flame,
  ArrowRight,
  Clock,
  Briefcase,
  Target,
  Sparkles,
} from "lucide-react";

export default function About() {
  const stats = [
    { label: "Years of Engineering Excellence", value: "20+" },
    { label: "Cylinders Refilled & Tested", value: "35,000+" },
    { label: "Premises Under Active AMC", value: "480+" },
    { label: "Form B Municipal Compliance Rate", value: "99.8%" },
  ];

  return (
    <>
      <Seo
        title="About Us — Shubam Fire Protection | Professional Safety Solutions"
        description="Shubam Fire Protection is a licensed fire protection engineering contractor and safety equipment provider in Navi Mumbai, delivering ISI-certified equipment, suppression systems, and AMC maintenance."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "About Us" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Licensed Fire Protection Contractor
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Engineered for Protection. Trusted for Decades.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Shubam Fire Protection provides turnkey life safety engineering, fire hydrant networks, automatic clean agent gas flooding systems, certified cylinder refilling, and statutory Form B AMC maintenance for residential societies and industrial enterprises across Maharashtra.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="primary">
                <Link to="/products">
                  Explore Certified Equipment <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="white">
                <Link to="/services/amc">View AMC Maintenance Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-all"
            >
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-primary-600 block">
                {s.value}
              </span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Story & Mission */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Our Legacy & Core Values
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              Two Decades of Protecting Mumbai and Maharashtra
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Founded in Navi Mumbai, Shubam Fire Protection began with an uncompromising mission: eliminate counterfeit, adulterated fire extinguishers from residential and commercial properties. Over the past two decades, we have expanded into a full-scale fire protection engineering company managing large-scale industrial hydrant installations, FM-200 / Novec clean agent flooding systems, and annual maintenance for prominent IT parks, logistics warehouses, and housing societies.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our central workshop in Turbhe MIDC is equipped with calibrated 35-bar and 250-bar hydrostatic proof test pumps, nitrogen charging manifolds, and chemical refilling stations operating strictly under Bureau of Indian Standards (BIS) and PESO norms.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button asChild variant="primary">
                <Link to="/services">
                  Our Engineering Services <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/contact">Contact Our Engineers</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-2.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Strict BIS Standards
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every fire extinguisher conforms strictly to IS 15683, IS 2878, or IS 10204.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-2.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Form B Licensed Agency
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Legally authorized to test installations and issue statutory Form B certificates.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-2.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Certified Technicians
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Field staff trained in chemical handling, high-pressure gas, and live drills.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-2.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                4-Hour Emergency SLA
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rapid emergency dispatch vans stationed across Navi Mumbai and Thane belts.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <CTASection
          title="Protect Your Facility with Certified Fire Engineering"
          subtitle="Shubam Fire Protection delivers end-to-end protection: equipment supply, AMC maintenance, refilling, and Form B compliance."
          primaryBtnText="Request Commercial Proposal"
          primaryBtnLink="/request-quote"
          secondaryBtnText="Explore AMC Maintenance"
          secondaryBtnLink="/services/amc"
        />
      </main>
    </>
  );
}
