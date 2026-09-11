import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Wrench, ShieldCheck, CheckCircle2, ArrowRight, Truck, Award, AlertTriangle } from "lucide-react";

export default function RefillingService() {
  const rateCard = [
    { type: "ABC Dry Powder (MAP 50%)", sizes: "1kg, 2kg, 4kg, 6kg, 9kg", rate: "From ₹350 per unit", testInterval: "Refill every 1-3 years / Hydro test 3 yrs" },
    { type: "Carbon Dioxide (CO2 Gas)", sizes: "2kg, 3.2kg, 4.5kg, 6.8kg, 9kg, 22.5kg", rate: "From ₹550 per unit", testInterval: "Refill on discharge / Hydro test 5 yrs" },
    { type: "Clean Agent (FE-36 / HFC-236fa)", sizes: "2kg, 4kg, 6kg", rate: "From ₹1,800 per unit", testInterval: "Zero residue / Hydro test 3 yrs" },
    { type: "Mechanical Foam (AFFF 6%)", sizes: "9 Litres, 50 Litres Trolley", rate: "From ₹650 per unit", testInterval: "Annual chemical flush & recharge" },
    { type: "Water Type Gas Cartridge", sizes: "9 Litres, 50 Litres", rate: "From ₹400 per unit", testInterval: "Annual flush & cartridge replacement" },
  ];

  return (
    <>
      <Seo
        title="Fire Extinguisher Refilling & Hydro-Testing Service — AK Fire Safety"
        description="BIS-certified fire extinguisher chemical & gas refilling, pressure gauge checks, and hydrostatic pressure testing in Navi Mumbai."
      />

      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">Certified Workshop & Mobile Units</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Certified Cylinder Refilling & Hydro-Testing
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-2xl leading-relaxed">
            Every discharged or time-expired fire extinguisher must be refilled with genuine BIS-grade extinguishing
            chemicals and hydraulically tested to guarantee safety during emergency use.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Why periodic refilling matters */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-black/10 shadow-sm">
            <Award className="w-8 h-8 text-brand mb-3" />
            <h3 className="font-bold text-base text-ink">Original Siliconized Powder</h3>
            <p className="text-xs text-steel mt-1 leading-relaxed">
              We never use adulterated chalk or uncertified yellow dust. Only genuine 50% Mono-Ammonium Phosphate (MAP) powder conforming to IS 4308 is filled.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-black/10 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-brand mb-3" />
            <h3 className="font-bold text-base text-ink">35 Bar Hydrostatic Proof Test</h3>
            <p className="text-xs text-steel mt-1 leading-relaxed">
              Extinguisher shells are pressure tested to 35 bar (250 bar for CO2) on calibrated test rigs to prevent catastrophic cylinder ruptures.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-black/10 shadow-sm">
            <Truck className="w-8 h-8 text-brand mb-3" />
            <h3 className="font-bold text-base text-ink">Free Doorstep Pickup & Drop</h3>
            <p className="text-xs text-steel mt-1 leading-relaxed">
              For commercial societies and plants with 5 or more units in Navi Mumbai, our logistics team picks up and returns extinguishers with loaner standby units provided.
            </p>
          </div>
        </div>

        {/* Refilling Rate Card */}
        <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-black/10 bg-paper flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Standard Refilling Rate Card</h2>
              <p className="text-xs text-steel">Includes high purity propellant charge, new O-rings, safety pin, and test certificate</p>
            </div>
            <Link
              to="/book-service?type=Refilling"
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              Book Refill Pickup <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-black/10 text-steel font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Extinguisher Medium</th>
                  <th className="py-3 px-4">Capacities Serviced</th>
                  <th className="py-3 px-4">Testing Norms</th>
                  <th className="py-3 px-4 text-right">Standard Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rateCard.map((row, idx) => (
                  <tr key={idx} className="hover:bg-paper/50">
                    <td className="py-3 px-4 font-bold text-ink">{row.type}</td>
                    <td className="py-3 px-4 text-steel">{row.sizes}</td>
                    <td className="py-3 px-4 text-steel">{row.testInterval}</td>
                    <td className="py-3 px-4 text-right font-bold text-brand">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
