import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import {
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Flame,
  ArrowRight,
  Phone,
  Building,
  FileSpreadsheet,
  Settings,
} from "lucide-react";

export default function InstallationService() {
  const installationCapabilities = [
    {
      title: "Fire Hydrant & Wet Riser Systems",
      standard: "IS 3844 / IS 5290 / NBC Part 4",
      description:
        "Turnkey installation of internal and external hydrant networks, heavy duty MS ERW Class C piping, single and double landing valves, hose reels, and 4-way fire brigade inlet breaching connections.",
      applications: "High-rise commercial towers, industrial sheds, residential complexes, logistic warehouses.",
    },
    {
      title: "Automatic Sprinkler Protection Grid",
      standard: "IS 15105 / NFPA 13",
      description:
        "Hydraulically calculated sprinkler systems featuring fast-response UL/FM approved 68°C / 79°C glass bulb pendant, upright, and sidewall sprinkler heads, along with alarm check valves and water motor gongs.",
      applications: "Basement parking levels, department stores, manufacturing floors, hotel guest floors.",
    },
    {
      title: "Addressable Fire Alarm & Smoke Detection",
      standard: "IS 2189 / EN 54 / NFPA 72",
      description:
        "Intelligent multi-loop micro-controller panels with optical smoke sensors, thermal rate-of-rise detectors, manual call points (MCP), response indicators, and talkback intercom integration.",
      applications: "Corporate headquarters, hospital wards, educational institutions, pharma clean rooms.",
    },
    {
      title: "Gas Flooding & Clean Agent Suppression",
      standard: "NFPA 2001 / IS 15493",
      description:
        "Waterless gas fire suppression engineered for high-value critical assets using FM-200 (HFC-227ea) or Novec 1230. Instant fire suppression within 10 seconds without electrical conductivity or collateral residue.",
      applications: "Server rooms, telecom exchange hubs, electrical control MCC panels, battery banks.",
    },
    {
      title: "Commercial Kitchen Hood Fire Suppression",
      standard: "NFPA 96 / NFPA 17A / UL 300",
      description:
        "Automatic wet chemical extinguishing systems designed specifically to conquer high-temperature oil and grease fires in restaurant kitchen hoods, ducts, and cooking fryers.",
      applications: "Hotel commercial kitchens, cloud kitchens, food court restaurants, banquet catering.",
    },
    {
      title: "Fire Pumping Stations & Hydro-Pneumatic System",
      standard: "IS 15301 / NBC Part 4",
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
        "Our certified fire protection engineers review architectural CAD layouts, water reservoir capacity, hazard classifications, and compute friction head losses.",
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
        "On-site erection by certified welders, grooved mechanical couplings, followed by hydrostatic pressure testing at 15 to 20 kg/cm² held for 2 hours.",
    },
    {
      step: "04",
      title: "Commissioning & CFO Form A/B Filing",
      description:
        "Live functional flow testing, alarm loop diagnostics, handover documentation, and preparation of Form A/B for Fire Department provisional NOC.",
    },
  ];

  return (
    <>
      <Seo
        title="Fire Fighting Systems Installation & Commissioning — AK Fire Safety Service"
        description="Turnkey fire hydrant, sprinkler, clean agent FM-200, and alarm system installation services in Navi Mumbai and Maharashtra under NBC 2016 norms."
      />

      {/* Hero */}
      <div className="bg-ink text-white py-12 border-b-4 border-brand">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs font-bold font-mono tracking-widest text-amber uppercase">
            Turnkey Engineering & Contracting
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-2 text-white">
            Fire Fighting Systems Installation & Commissioning
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mt-3 leading-relaxed">
            Full-scope engineering, procurement, and construction (EPC) of fire hydrant networks, automatic
            sprinklers, FM-200 gas flooding, and intelligent detection systems across Maharashtra.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/request-quote"
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded shadow-md transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Request Project Quotation
            </Link>
            <Link
              to="/book-service"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded border border-white/20 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Schedule On-Site Engineering Survey
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Key Competencies Grid */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-ink">Turnkey Fire Safety Contracting</h2>
            <p className="text-xs sm:text-sm text-steel mt-1">
              Engineered according to National Building Code (NBC) 2016, Bureau of Indian Standards (BIS), and NFPA
              guidelines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {installationCapabilities.map((cap, idx) => (
              <div
                key={idx}
                className="bg-white border border-black/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-ink">{cap.title}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-paper text-steel font-mono text-[10px]">
                    {cap.standard}
                  </span>
                  <p className="text-xs text-steel mt-3 leading-relaxed">{cap.description}</p>
                </div>
                <div className="pt-3 border-t border-black/5 text-[11px] text-steel">
                  <strong className="text-ink block mb-0.5">Key Applications:</strong>
                  {cap.applications}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Step Process Section */}
        <section className="bg-paper border border-black/10 rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand uppercase tracking-wider font-mono">
              Engineering Rigor
            </span>
            <h2 className="text-2xl font-display font-bold text-ink mt-1">Our 4-Stage Execution Methodology</h2>
            <p className="text-xs text-steel mt-1">
              From blueprint approval to Fire Department Provisional / Final Fire NOC handover.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {executionSteps.map((step, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-black/10 shadow-sm space-y-2">
                <span className="text-2xl font-display font-bold text-brand">{step.step}</span>
                <h3 className="font-display font-bold text-sm text-ink">{step.title}</h3>
                <p className="text-xs text-steel leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Guarantee Banner */}
        <section className="bg-ink text-white rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-amber font-display font-bold text-base">
              <ShieldCheck className="w-5 h-5" /> Maharashtra Licensed Category &lsquo;A&rsquo; Fire Agency
            </div>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              We provide complete liaison and technical documentation to secure Form A (Certificate of Completion) and
              Form B (Biannual Maintenance) for municipal corporations in Navi Mumbai (NMMC), CIDCO, Panvel (PMC), and
              Thane (TMC).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/request-quote"
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-bold shadow-md transition-colors text-center"
            >
              Get Itemized Quotation
            </Link>
            <a
              href="tel:+919800000000"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold border border-white/20 transition-colors text-center flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" /> Call +91 98000 00000
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
