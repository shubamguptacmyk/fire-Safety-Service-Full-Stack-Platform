import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import {
  Wrench,
  ShieldCheck,
  ClipboardCheck,
  Flame,
  ArrowRight,
  Truck,
  Building2,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

export default function Services() {
  const services = [
    {
      href: "/services/amc",
      title: "Annual Maintenance Contracts (AMC)",
      badge: "Statutory Mandate",
      desc: "Scheduled quarterly and bi-annual inspections, preventative pressure checks, and Form B certificate issuance for buildings and societies.",
      features: ["Quarterly scheduled technician visits", "Form B compliance assistance", "Emergency repair callouts included"],
    },
    {
      href: "/services/refilling",
      title: "Certified Cylinder Refilling & Hydro-Testing",
      badge: "BIS Tested",
      desc: "Authentic MAP 50% ABC powder, CO2 gas, clean agent, and foam refills with 35-bar calibrated hydrostatic pressure testing.",
      features: ["Genuine BIS chemical formulations", "Hydrostatic testing up to 250 bar", "Free pickup & loaner units in Navi Mumbai"],
    },
    {
      href: "/services/fire-safety-audit",
      title: "Building Fire Safety Audits",
      badge: "NBC Part IV",
      desc: "On-site risk assessment by certified Fire Safety Officers evaluating escape corridors, pump houses, and hydrant wet risers.",
      features: ["Full gap analysis report", "Evacuation plan recommendations", "Statutory municipal notice compliance"],
    },
    {
      href: "/book-service?type=Installation",
      title: "Hydrant & Suppression System Installation",
      badge: "Turnkey Projects",
      desc: "Complete design, piping fabrication, and commissioning of wet riser hydrants, sprinkler loops, and FM-200 gas flooding systems.",
      features: ["Certified welding & pressure testing", "UL-listed clean agent systems", "Pumps & control panel integration"],
    },
    {
      href: "/book-service?type=Inspection",
      title: "Periodic Safety Inspection & Pressure Audits",
      badge: "Pre-Audit Check",
      desc: "Fast on-demand safety audit of all fire extinguishers and smoke detectors across your facility with instant digital reports.",
      features: ["Pin & tamper seal check", "Pressure gauge verification", "Barcode tagging & asset register"],
    },
    {
      href: "/book-service?type=Repair",
      title: "Emergency Repairs & Spares Replacement",
      badge: "Rapid Response",
      desc: "Replacement of burst discharge hoses, leaking valves, uncalibrated pressure gauges, and broken hydrant handwheels.",
      features: ["Same-day emergency response", "Genuine brass replacement fittings", "100% leak testing"],
    },
  ];

  return (
    <>
      <Seo
        title="Fire Protection Services in Navi Mumbai — AK Fire Safety"
        description="Comprehensive fire safety services: AMC maintenance, extinguisher refilling, building safety audits, and hydrant installations in Mumbai & Navi Mumbai."
      />

      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">Turnkey Fire Engineering</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Certified Fire Protection Services
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-2xl leading-relaxed">
            From single extinguisher refilling to multi-storey hydrant pipeline installations and statutory
            Form B audits, our licensed technicians ensure 100% regulatory compliance.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-black/10 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-brand/40 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-2 py-0.5 rounded">
                  {s.badge}
                </span>
                <h2 className="text-lg font-bold text-ink font-display mt-2">{s.title}</h2>
                <p className="text-xs text-steel mt-2 leading-relaxed">{s.desc}</p>

                <ul className="mt-4 space-y-1.5 text-xs text-ink/80">
                  {s.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-black/10">
                <Link
                  to={s.href}
                  className="w-full py-2 bg-paper hover:bg-brand hover:text-white text-ink text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-black/10"
                >
                  Explore Service Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Helpline Banner */}
        <div className="bg-gradient-to-r from-ink to-brand-dark text-white rounded-2xl p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber font-bold">24/7 Rapid Response Desk</span>
            <h2 className="text-2xl font-display font-bold mt-1">Need Urgent Inspection or Emergency Recharge?</h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-lg">
              Our service vans cover Vashi, Belapur, Mahape, Taloja, Airoli, and Panvel with ready cylinder stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/book-service"
              className="px-6 py-3 bg-white text-ink font-bold text-xs rounded-lg hover:bg-gray-100 shadow-sm"
            >
              Book Technician Online
            </Link>
            <a
              href="tel:+919999999999"
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-sm"
            >
              <PhoneCall className="w-4 h-4" /> Call Helpline: +91 99999 99999
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
