import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import CTASection from "@/components/ui/CTASection";
import TrustBadge from "@/components/ui/TrustBadge";
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Flame,
  ArrowRight,
  Phone,
  Building2,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Droplets,
  Bell,
  Cpu,
  Utensils,
  Zap,
} from "lucide-react";

export default function InstallationService() {
  const installationCapabilities = [
    {
      title: "Fire Hydrant & Wet Riser Systems",
      standard: "IS 3844 / IS 5290 / NBC Part 4",
      icon: Droplets,
      description:
        "Turnkey erection of internal and external hydrant ring networks, heavy duty MS ERW Class C piping, single and double landing valves, hose reels, and 4-way fire brigade inlet breaching connections.",
      applications: "High-rise commercial towers, industrial sheds, residential complexes, logistics parks.",
    },
    {
      title: "Automatic Sprinkler Protection Grid",
      standard: "IS 15105 / NFPA 13",
      icon: Flame,
      description:
        "Hydraulically calculated sprinkler systems featuring fast-response UL/FM approved 68°C / 79°C glass bulb pendant, upright, and sidewall sprinkler heads, along with alarm check valves and water motor gongs.",
      applications: "Basement parking levels, department stores, manufacturing floors, hotel guest corridors.",
    },
    {
      title: "Addressable Fire Alarm & Smoke Detection",
      standard: "IS 2189 / EN 54 / NFPA 72",
      icon: Bell,
      description:
        "Intelligent multi-loop micro-controller panels with optical smoke sensors, thermal rate-of-rise detectors, manual call points (MCP), response indicators, and talkback intercom integration.",
      applications: "Corporate headquarters, hospital wards, educational institutions, pharma clean rooms.",
    },
    {
      title: "Gas Flooding & Clean Agent Suppression",
      standard: "NFPA 2001 / IS 15493",
      icon: Cpu,
      description:
        "Waterless gas fire suppression engineered for high-value critical assets using FM-200 (HFC-227ea) or Novec 1230. Instant fire suppression within 10 seconds without electrical conductivity or collateral residue.",
      applications: "Server rooms, telecom exchange hubs, electrical control MCC panels, battery banks.",
    },
    {
      title: "Commercial Kitchen Hood Fire Suppression",
      standard: "NFPA 96 / NFPA 17A / UL 300",
      icon: Utensils,
      description:
        "Automatic wet chemical extinguishing systems designed specifically to conquer high-temperature oil and grease fires in restaurant kitchen hoods, ducts, and cooking fryers.",
      applications: "Hotel commercial kitchens, cloud kitchens, food court restaurants, banquet catering.",
    },
    {
      title: "Fire Pumping Stations & Hydro-Pneumatic Systems",
      standard: "IS 15301 / NBC Part 4",
      icon: Zap,
      description:
        "Supply and erection of multi-stage split casing main electric pumps, standby diesel engine-driven fire pumps, and pressure-sensing jockey pumps with fully automated MCC control panels.",
      applications: "Municipal water supplies, township fire loops, heavy engineering chemical estates.",
    },
  ];

  const executionSteps = [
    {
      step: "01",
      title: "Site Survey & Hydraulic Calculation",
      description:
        "Our certified fire protection engineers review architectural CAD layouts, water reservoir capacity, hazard classifications, and compute friction head losses per NBC norms.",
    },
    {
      step: "02",
      title: "Material Dispatch & BIS Verification",
      description:
        "Procurement of heavy-gauge pipes, valves, sprinkler nozzles, and detectors carrying authentic ISI holograms and factory test certificates.",
    },
    {
      step: "03",
      title: "Fabrication, Welding & Pressure Testing",
      description:
        "On-site erection by certified welders, grooved mechanical couplings, followed by hydrostatic pressure testing at 15 to 20 kg/cm² held continuously for 2 hours.",
    },
    {
      step: "04",
      title: "CFO Commissioning & Final Sign-Off",
      description:
        "Comprehensive dynamic flow testing, automatic pump cut-in simulation, integration testing, and documentation assistance for Chief Fire Officer (CFO) NOC issuance.",
    },
  ];

  return (
    <>
      <Seo
        title="Fire Hydrant & Fire Suppression System Installation — Shubam Fire Protection"
        description="Turnkey fire protection EPC engineering: wet risers, automatic sprinkler grids, FM-200 clean agent gas flooding, and fire pump rooms in Navi Mumbai."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: "Hydrant & Suppression System Installation" },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <Wrench className="w-3.5 h-3.5" /> Turnkey EPC Fire Engineering
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Fire Hydrant & Suppression System Installation
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Complete design, hydraulic modeling, MS Class C piping erection, and commissioning of wet risers, automatic sprinkler loops, FM-200 gas flooding, and multi-stage pump stations for residential complexes, IT parks, and industrial warehouses.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="primary">
                <Link to="/request-quote">
                  Request Project RFQ <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="white">
                <Link to="/book-service?type=Installation">Schedule Site Survey</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Capabilities Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              EPC Scope
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Engineered Fire Suppression Capabilities
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From heavy-duty industrial hydrant rings to micro-second clean agent server room flooding systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {installationCapabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 rounded-full text-slate-700 font-mono text-[11px] font-semibold">
                        {cap.standard}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-display group-hover:text-primary-700 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Ideal Applications:
                    </span>
                    <p className="text-xs text-slate-700 font-medium">
                      {cap.applications}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Step Execution Workflow */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
              Project Lifecycle
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
              4-Step Turnkey Execution Process
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              Every project is managed under strict quality gates, from initial CAD hydraulic calculations to municipal CFO NOC approvals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {executionSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-extrabold text-primary-400 font-display block mb-2">
                    {step.step}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-white leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <CTASection
          title="Planning a New Construction or Factory Fire System Project?"
          subtitle="Shubam Fire Protection provides turnkey EPC execution, hydraulic engineering, CFO liaison, and municipal Form A/B sign-offs across Maharashtra."
          primaryBtnText="Request Project Consultation"
          primaryBtnLink="/request-quote"
          secondaryBtnText="Book Site Visit"
          secondaryBtnLink="/book-service?type=Installation"
        />
      </main>
    </>
  );
}
