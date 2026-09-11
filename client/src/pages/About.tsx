import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
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
} from "lucide-react";

export default function About() {
  const stats = [
    { label: "Years of Fire Engineering", value: "21+" },
    { label: "Cylinders Refilled & Tested", value: "35,000+" },
    { label: "Commercial Buildings Under AMC", value: "480+" },
    { label: "Municipal Form B Audit Pass Rate", value: "99.8%" },
  ];

  return (
    <>
      <Seo
        title="About Us — AK Fire Safety Service Navi Mumbai"
        description="Established in 2003, AK Fire Safety is a licensed fire protection contractor delivering ISI-certified equipment, suppression systems, and AMC maintenance across Maharashtra."
      />

      <div className="bg-ink text-white py-14 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">Navi Mumbai Since 2003</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Engineered for Protection. Trusted for Decades.
          </h1>
          <p className="text-white/70 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            AK Fire Safety Service is a licensed fire engineering contractor and equipment manufacturer providing
            state-of-the-art life safety, hydrant networks, automatic gas suppression, and preventative AMC services.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white border border-black/10 rounded-xl p-6 text-center shadow-sm">
              <span className="text-3xl sm:text-4xl font-display font-bold text-brand block">{s.value}</span>
              <span className="text-xs text-steel font-medium mt-1 block">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Story & Mission */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Our Legacy</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-1">
              Two Decades of Protecting Mumbai and Maharashtra
            </h2>
            <p className="text-xs sm:text-sm text-steel mt-3 leading-relaxed">
              Founded in 2003 in Navi Mumbai, AK Fire Safety began with a clear mission: eliminate counterfeit,
              adulterated fire extinguishers from residential and commercial buildings. Over the past 21 years,
              we have expanded into a full-scale fire engineering firm managing large-scale industrial hydrant
              installations, FM-200 clean agent server room flooding systems, and annual maintenance for leading
              IT parks, logistics warehouses, and residential societies.
            </p>
            <p className="text-xs sm:text-sm text-steel mt-3 leading-relaxed">
              Our service workshop in Turbhe MIDC is equipped with calibrated 35-bar and 250-bar hydrostatic test
              pumps, nitrogen charging manifolds, and chemical refilling stations operating strictly under BIS norms.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                Browse Equipment <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/services/amc"
                className="px-5 py-2.5 bg-paper hover:bg-gray-200 border border-black/10 text-ink rounded text-xs font-semibold transition-colors"
              >
                Explore AMC Plans
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-paper rounded-xl p-5 border border-black/10 space-y-2">
              <ShieldCheck className="w-6 h-6 text-brand" />
              <h3 className="font-bold text-sm text-ink">Strict BIS Standards</h3>
              <p className="text-xs text-steel">Every extinguisher conforms strictly to IS 15683, IS 2878, or IS 10204.</p>
            </div>
            <div className="bg-paper rounded-xl p-5 border border-black/10 space-y-2">
              <Award className="w-6 h-6 text-brand" />
              <h3 className="font-bold text-sm text-ink">Form B Licensed Agency</h3>
              <p className="text-xs text-steel">Authorized to test installations and issue statutory Form B certificates.</p>
            </div>
            <div className="bg-paper rounded-xl p-5 border border-black/10 space-y-2">
              <Users className="w-6 h-6 text-brand" />
              <h3 className="font-bold text-sm text-ink">Certified Technicians</h3>
              <p className="text-xs text-steel">Field staff trained in chemical handling, high-pressure gas, and live drills.</p>
            </div>
            <div className="bg-paper rounded-xl p-5 border border-black/10 space-y-2">
              <Clock className="w-6 h-6 text-brand" />
              <h3 className="font-bold text-sm text-ink">4-Hour Emergency SLA</h3>
              <p className="text-xs text-steel">Rapid deployment vans stationed across Navi Mumbai and Thane belts.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
