import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
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
} from "lucide-react";

export default function InspectionService() {
  const inspectionModules = [
    {
      title: "Extinguisher Weight & Gauge Diagnostics",
      frequency: "Monthly / Quarterly",
      standard: "IS 2190:2010",
      description:
        "Physical inspection of nitrogen pressure needles, mechanical tamper seals, discharge horn obstructions, and precision weight verification for CO2 gas loss exceeding 10%.",
      points: [
        "Pressure gauge needle within 15-18 kg/cm² zone",
        "Discharge nozzle unobstructed by debris or insect nests",
        "Safety pin and tamper-evident wire seal intact",
        "Gross weight logged against tare weight stamped on body",
      ],
    },
    {
      title: "Fire Hydrant & Landing Valve Flow Tests",
      frequency: "Quarterly",
      standard: "IS 5290 / IS 3844",
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
      title: "Fire Pump House Auto-Sequence Diagnostic",
      frequency: "Monthly",
      standard: "IS 15301 / NBC Part 4",
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
      description:
        "Calibrated aerosol smoke and heat spray testing across addressable loops, response indicator illumination checks, and central panel fault diagnostics.",
      points: [
        "Aerosol test ensuring trip response within 15 seconds",
        "Strobe horn sound level exceeds 85 dBA at 3 meters",
        "Battery backup standby capacity test for 24 hours",
        "Loop circuit resistance and earth fault diagnostics",
      ],
    },
    {
      title: "Emergency Exit Lighting & Signage Survey",
      frequency: "Monthly",
      standard: "IS 1644 / NBC Part 4",
      description:
        "Photometric verification of photoluminescent glow duration and emergency battery-backed directional exit lighting along all designated egress pathways.",
      points: [
        "Battery discharge test exceeding 90 minutes runtime",
        "Photoluminescent luminance after ambient light shutoff",
        "Emergency panic push-bars on fire doors functioning smoothly",
        "Corridor egress free from temporary carton storage blockages",
      ],
    },
  ];

  return (
    <>
      <Seo
        title="Fire Safety Equipment Inspection & Testing — AK Fire Safety Service"
        description="Comprehensive quarterly fire fighting equipment inspection, hydrant flow testing, and sprinkler diagnostic services in Navi Mumbai and Mumbai MMR."
      />

      {/* Hero */}
      <div className="bg-ink text-white py-12 border-b-4 border-amber">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs font-bold font-mono tracking-widest text-amber uppercase">
            Preventative Safety Engineering
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-2 text-white">
            Fire Safety Equipment Inspection & Diagnostic Testing
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mt-3 leading-relaxed">
            Statutory routine visual surveys, live hydrostatic pressure testing, and hydraulic flow audits performed by
            certified fire safety technicians to guarantee system readiness.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/book-service"
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded shadow-md transition-colors flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" /> Book On-Site Inspection
            </Link>
            <Link
              to="/service-history"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded border border-white/20 transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" /> View Sample Job Card Records
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Inspection Modules Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-ink">Comprehensive Inspection Protocols</h2>
            <p className="text-xs sm:text-sm text-steel mt-1">
              Every apparatus on your premises tested against strict Bureau of Indian Standards failure tolerances.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspectionModules.map((mod, idx) => (
              <div
                key={idx}
                className="bg-white border border-black/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-paper text-brand font-mono text-[11px] font-bold">
                      {mod.standard}
                    </span>
                    <span className="text-[10px] text-steel flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {mod.frequency}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-ink">{mod.title}</h3>
                  <p className="text-xs text-steel mt-2 leading-relaxed">{mod.description}</p>
                </div>

                <div className="pt-3 border-t border-black/5 space-y-1.5">
                  <strong className="text-ink text-[11px] block">Verification Checklist:</strong>
                  {mod.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5 text-xs text-steel">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Inspection Fails Callout */}
        <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-display font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> The Real Risk: Neglected Fire Equipment
          </div>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed max-w-3xl">
            In over 68% of commercial building fires investigated in India, fire extinguishers failed to operate due to
            clogged discharge nozzles, dry chemical powder caking, or undetectable micro-leakage in pressure valves.
            Periodic physical inspections detect and resolve these defects before lives and property are jeopardized.
          </p>
          <div className="pt-2">
            <Link
              to="/book-service"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:underline"
            >
              Book an Inspection for your premises today <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Quick CTA */}
        <section className="bg-ink text-white rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-white">Need an Emergency Safety Audit or Form B Sign-Off?</h3>
            <p className="text-xs text-white/70">
              Our licensed engineers can be dispatched within 4 hours across Navi Mumbai, Taloja, Thane, and Mumbai MMR.
            </p>
          </div>
          <a
            href="tel:+919800000000"
            className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-bold transition-colors flex items-center gap-2 shadow-md"
          >
            <Phone className="w-4 h-4" /> Call 24/7 Helpline: +91 98000 00000
          </a>
        </section>
      </main>
    </>
  );
}
