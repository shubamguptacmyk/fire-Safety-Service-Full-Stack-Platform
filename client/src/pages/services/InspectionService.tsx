import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import CTASection from "@/components/ui/CTASection";
import TrustBadge from "@/components/ui/TrustBadge";
import {
  ClipboardCheck,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Activity,
  AlertTriangle,
  ArrowRight,
  Phone,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Droplets,
  Bell,
  Scale,
} from "lucide-react";

export default function InspectionService() {
  const inspectionModules = [
    {
      title: "Extinguisher Weight & Gauge Diagnostics",
      frequency: "Monthly / Quarterly",
      standard: "IS 2190:2010",
      icon: Scale,
      description:
        "Physical inspection of nitrogen pressure needles, mechanical tamper seals, discharge horn obstructions, and precision weight verification for CO2 gas loss exceeding 10%.",
      points: [
        "Pressure gauge needle within 15-18 kg/cm² operating zone",
        "Discharge nozzle unobstructed by debris or insect nests",
        "Safety pin and tamper-evident wire seal intact",
        "Gross weight logged against tare weight stamped on body",
      ],
    },
    {
      title: "Fire Hydrant & Landing Valve Flow Tests",
      frequency: "Quarterly",
      standard: "IS 5290 / IS 3844",
      icon: Droplets,
      description:
        "Dynamic pitot tube flow rate and residual pressure measurements at the remotest hydrant landing valve to guarantee compliance with municipal firefighting standards.",
      points: [
        "Dynamic flow test exceeding 900 LPM at farthest outlet",
        "Residual pressure verification not less than 3.5 kg/cm²",
        "Gland packing leakage inspection and lubrication",
        "Hose box canvas hose hydro-test to 15 kg/cm²",
      ],
    },
    {
      title: "Automatic Sprinkler System Audits",
      frequency: "Quarterly / Biannual",
      standard: "IS 15105 / NFPA 25",
      icon: Activity,
      description:
        "Full test of alarm check valves, retard chambers, water motor gongs, inspector test valves, and sprinkler head clearance from storage racks.",
      points: [
        "Inspector Test Connection (ITC) opening to verify gong trip",
        "Main drain 2-inch valve flow pressure drop log",
        "Clearance distance of min 45cm under sprinkler heads",
        "Free of paint, corrosion, or physical deformation",
      ],
    },
    {
      title: "Fire Pump House Auto-Sequence Diagnostics",
      frequency: "Monthly",
      standard: "IS 15301 / NBC Part 4",
      icon: Zap,
      description:
        "Live simulation of pressure drops to confirm sequential automatic staging of Jockey, Main Electric, and Standby Diesel engine fire pumps.",
      points: [
        "Jockey cut-in at 6.0 kg/cm² and cut-out at 7.0 kg/cm²",
        "Main electric cut-in at 5.0 kg/cm² upon continuous demand",
        "Diesel standby auto-start on mains electric power failure",
        "Diesel fuel level, battery electrolyte and cranking motor test",
      ],
    },
    {
      title: "Smoke Detector Sensitivity & Loop Testing",
      frequency: "Bi-Monthly / Quarterly",
      standard: "IS 2189 / EN 54",
      icon: Bell,
      description:
        "Calibrated aerosol smoke and heat spray testing across addressable loops, response indicator illumination checks, and central panel fault diagnostics.",
      points: [
        "Aerosol test ensuring trip response within 15 seconds",
        "Strobe horn sound level exceeds 85 dBA at 3 meters",
        "Battery backup standby capacity test for 24 hours",
        "Loop circuit resistance and earth fault diagnostics",
      ],
    },
  ];

  return (
    <>
      <Seo
        title="Periodic Safety Inspection & Pressure Audits — Shubam Fire Protection"
        description="Comprehensive fire safety inspection, flow rate testing, and pressure audits conforming to IS 2190, IS 3844, and IS 15105 across Navi Mumbai."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: "Periodic Safety Inspection & Audits" },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <ClipboardCheck className="w-3.5 h-3.5" /> Preventative Maintenance & Testing
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Periodic Safety Inspection & Pressure Diagnostics
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Ensure emergency readiness before disaster strikes. Our certified technicians carry out systematic diagnostic tests across your fire extinguishers, hydrant landing valves, sprinkler alarm gongs, and detection loops with instant digital logging.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="primary">
                <Link to="/book-service?type=Inspection">
                  Book Inspection Visit <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="white">
                <Link to="/services/amc">View Annual AMC Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Inspection Modules Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Technical Modules
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Comprehensive Fire Apparatus Inspection Scope
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every inspection is conducted according to Bureau of Indian Standards (BIS) and NBC Part IV engineering guidelines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {inspectionModules.map((module, idx) => {
              const Icon = module.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 rounded-full text-slate-700 font-mono text-[11px] font-semibold">
                        {module.standard}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-display">
                      {module.title}
                    </h3>
                    <span className="inline-block text-xs font-bold text-primary-600 mt-1">
                      Frequency: {module.frequency}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                      {module.description}
                    </p>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Key Verification Checkpoints:
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {module.points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Button asChild variant="secondary" className="w-full">
                      <Link to={`/book-service?type=Inspection&scope=${encodeURIComponent(module.title)}`}>
                        Schedule This Inspection <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Tagging & Barcoding */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 grid lg:grid-cols-3 gap-8 items-center shadow-xl">
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Asset Integrity Tracking
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              QR Barcode Tagging & Digital Maintenance Logs
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every inspected fire extinguisher and hydrant station is stamped with a weather-resistant metallic or vinyl QR inspection tag. Technicians log test results directly to the cloud, giving you real-time visibility into equipment health, hydro-test expiration dates, and inspection history directly in your customer portal.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center shadow-lg space-y-3">
            <FileText className="w-10 h-10 text-primary-400 mx-auto" />
            <h4 className="text-base font-bold text-white font-display">Need an Asset Inspection Audit?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our technician team can audit up to 100 equipment units per day across Mumbai MMR.
            </p>
            <Button asChild variant="primary" className="w-full mt-2">
              <Link to="/book-service?type=Inspection">
                Book Audit Today
              </Link>
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <CTASection
          title="Ready to Ensure Complete Fire Protection Readiness?"
          subtitle="Shubam Fire Protection provides on-demand inspections, quarterly AMC maintenance, and Form B compliance certification."
          primaryBtnText="Book Inspection"
          primaryBtnLink="/book-service?type=Inspection"
          secondaryBtnText="Explore AMC Packages"
          secondaryBtnLink="/services/amc"
        />
      </main>
    </>
  );
}
