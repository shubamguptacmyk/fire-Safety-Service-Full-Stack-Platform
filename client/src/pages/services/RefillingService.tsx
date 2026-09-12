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
  ArrowRight,
  Truck,
  Award,
  AlertTriangle,
  Gauge,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function RefillingService() {
  const rateCard = [
    {
      type: "ABC Dry Powder (MAP 50%)",
      standard: "IS 15683 / IS 4308",
      sizes: "1kg, 2kg, 4kg, 6kg, 9kg",
      rate: "From ₹350 per unit",
      testInterval: "Refill on discharge or 3 yrs / Hydro test 3 yrs",
    },
    {
      type: "Carbon Dioxide (CO2 Gas)",
      standard: "IS 15683 / IS 2878",
      sizes: "2kg, 3.2kg, 4.5kg, 6.8kg, 9kg, 22.5kg",
      rate: "From ₹550 per unit",
      testInterval: "Refill on discharge / Hydro test 5 yrs (250 bar)",
    },
    {
      type: "Clean Agent (FE-36 / HFC-236fa)",
      standard: "IS 15683 / NFPA 2001",
      sizes: "2kg, 4kg, 6kg",
      rate: "From ₹1,800 per unit",
      testInterval: "Zero residue / Hydro test 3 yrs",
    },
    {
      type: "Mechanical Foam (AFFF 6%)",
      standard: "IS 15683 / IS 10204",
      sizes: "9 Litres, 50 Litres Trolley",
      rate: "From ₹650 per unit",
      testInterval: "Annual chemical flush & recharge / Hydro test 3 yrs",
    },
    {
      type: "Water Type (Gas Cartridge / Stored)",
      standard: "IS 15683 / IS 940",
      sizes: "9 Litres, 50 Litres Trolley",
      rate: "From ₹400 per unit",
      testInterval: "Annual flush & cartridge replacement",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Doorstep Pickup & Standby Loaners",
      desc: "Our logistics team collects expired or discharged cylinders and deploys temporary loaner standby units to ensure your premises are never left unprotected.",
    },
    {
      step: "02",
      title: "Ultrasonic Shell & Valve Diagnostic",
      desc: "Internal endoscopy inspection, thread inspection, safety relief valve cleaning, and weighing against factory stamped tare weight.",
    },
    {
      step: "03",
      title: "35-Bar Hydrostatic Proof Test",
      desc: "High-pressure hydraulic proof test (250 bar for CO2) on calibrated test benches to detect microscopic fissures, stress fatigue, or wall thinning.",
    },
    {
      step: "04",
      title: "BIS Chemical Refill & N2 Pressurization",
      desc: "Recharged with authentic Mono-Ammonium Phosphate 50% powder, pure food-grade CO2, or clean gas, pressurized with dry nitrogen to 15 kg/cm².",
    },
    {
      step: "05",
      title: "QR Barcode Tagging & Delivery",
      desc: "Sealed with tamper-proof wire locks, labeled with next hydro-test date and digital QR tracking code, and delivered with official test certificates.",
    },
  ];

  return (
    <>
      <Seo
        title="Fire Extinguisher Refilling & Hydrostatic Testing — Shubam Fire Protection"
        description="BIS-certified fire extinguisher chemical refilling, pressure gauge checks, and 35-bar / 250-bar hydrostatic pressure testing in Navi Mumbai & Mumbai MMR."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: "Cylinder Refilling & Hydro-Testing" },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <Wrench className="w-3.5 h-3.5" /> PESO & BIS Calibrated Test Workshop
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Certified Cylinder Refilling & Hydro-Testing
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Every discharged or time-expired fire extinguisher must be recharged with authentic BIS-grade extinguishing agents and hydraulically tested to guarantee 100% safety and zero risk of catastrophic cylinder ruptures during emergency operation.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="primary">
                <Link to="/book-service?type=Refilling">
                  Book Refill Pickup <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="white">
                <Link to="/contact">Ask Technical Question</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Why Periodic Refilling Matters */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Laboratory Quality Assurance
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Why Genuine Workshop Refilling Matters
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Counterfeit powders and uncalibrated filling stations can lead to extinguisher failure or fatal cylinder explosions during an active fire emergency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 font-display">
                Original Siliconized MAP 50%
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                We never use adulterated chalk, calcium carbonate, or uncertified yellow dust. Only genuine Mono-Ammonium Phosphate (MAP 50%) powder conforming to IS 4308 is filled, ensuring fluid powder fluidization without caking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 font-display">
                35 & 250 Bar Hydrostatic Proof Test
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Extinguisher shells are pressure tested to 35 bar (250 bar for seamless CO2) on calibrated test benches to detect stress fractures and prevent catastrophic cylinder ruptures in accordance with IS 2190 standards.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 font-display">
                Free Doorstep Pickup & Loaners
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                For commercial societies, factories, and corporate offices with 5 or more units in Navi Mumbai and Mumbai MMR, our logistics team picks up and returns extinguishers with temporary loaner standby units provided.
              </p>
            </div>
          </div>
        </div>

        {/* Refilling Rate Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                Transparent Pricing
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Standard Refilling & Hydro-Testing Rate Card
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                All prices include high-purity propellant charge, new O-rings, safety pin, tamper seal, and certificate of testing.
              </p>
            </div>
            <Button asChild size="md" variant="primary" className="shrink-0">
              <Link to="/book-service?type=Refilling">
                Book Refill Pickup <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-6">Extinguishing Medium</th>
                  <th className="py-4 px-6">BIS Norm</th>
                  <th className="py-4 px-6">Capacities Serviced</th>
                  <th className="py-4 px-6">Mandatory Testing Frequency</th>
                  <th className="py-4 px-6 text-right">Standard Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rateCard.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{row.type}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-xs">
                        {row.standard}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{row.sizes}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">{row.testInterval}</td>
                    <td className="py-4 px-6 text-right font-bold text-primary-700 whitespace-nowrap">
                      {row.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5-Step Refilling & Hydro-Testing Workflow */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Process Integrity
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Our 5-Step Hydrostatic & Refill Protocol
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every cylinder entering our workshop undergoes rigorous quality checks before being returned to your premises.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm relative flex flex-col justify-between hover:border-primary-300 transition-colors"
              >
                <div>
                  <span className="text-3xl font-extrabold text-primary-600/30 font-display block mb-2">
                    {step.step}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <CTASection
          title="Need 10+ Fire Extinguishers Refilled for Your Society or Plant?"
          subtitle="Shubam Fire Protection provides volume-discounted corporate refilling, loaner cylinder swaps, and on-site Form B documentation across Navi Mumbai."
          primaryBtnText="Schedule Corporate Pickup"
          primaryBtnLink="/book-service?type=Refilling"
          secondaryBtnText="Request Custom RFQ"
          secondaryBtnLink="/request-quote"
        />
      </main>
    </>
  );
}
