import Seo from "@/components/Seo";
import { ShieldCheck, Scale, FileText, AlertCircle, Wrench, RefreshCw } from "lucide-react";

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Service & Commercial Policy — AK Fire Safety Service"
        description="Statutory terms of sale, equipment warranty, AMC service agreements, and Form B compliance liability disclaimers."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Terms of Service & Commercial Policy</h1>
          <p className="text-xs sm:text-sm text-steel mt-1">
            Last Updated: January 2026 • Governed by Maharashtra Fire Prevention & Life Safety Measures Act, 2006
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-sm text-ink/90 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <Scale className="w-5 h-5" /> 1. Overview & Regulatory Jurisdiction
          </div>
          <p>
            AK Fire Safety Service (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) operates as a licensed
            fire protection equipment distributor, hydraulic refilling facility, and certified technical service
            provider in Navi Mumbai, Maharashtra, India.
          </p>
          <p>
            By procuring equipment, engaging AMC services, or submitting quotation requests through this portal, you
            (&ldquo;Client&rdquo;, &ldquo;Premises Occupier&rdquo;) agree to be bound by these Terms, the Indian
            Contract Act 1872, and the Maharashtra Fire Prevention and Life Safety Measures Act, 2006.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <ShieldCheck className="w-5 h-5" /> 2. Equipment Standards & Manufacturer Warranty
          </div>
          <ul className="list-disc list-inside space-y-2 text-steel">
            <li>
              <strong className="text-ink">BIS / ISI Certification:</strong> All portable fire extinguishers supplied
              carry valid Bureau of Indian Standards licenses (IS 15683 for portable extinguishers, IS 2878 for CO2,
              IS 5290 for landing valves).
            </li>
            <li>
              <strong className="text-ink">Warranty Period:</strong> New fire extinguishers carry a 12-month
              workmanship warranty from the date of invoice. Electronic smoke alarms and siren sounders carry a 24-month
              limited manufacturer warranty.
            </li>
            <li>
              <strong className="text-ink">Voiding of Warranty:</strong> Warranty is nullified if the tamper seal,
              safety pin, or pressure gauge seal is broken by non-certified third parties, or if apparatus is stored in
              corrosive, acidic, or unshaded environments exceeding 55°C.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <RefreshCw className="w-5 h-5" /> 3. Refilling, Hydro-Testing & Cylinder Condemnation
          </div>
          <p>
            Under IS 2190:2010 codes of practice, all fire extinguishers must undergo periodic hydrostatic pressure
            testing (portable ABC at 35 kg/cm², CO2 cylinders at 250 bar hydraulic test).
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950">
            <strong className="block font-bold mb-1">Mandatory Condemnation Notice:</strong>
            Any pressure vessel exhibiting wall thinning exceeding 10%, deep pitting corrosion, or structural neck bulge
            during hydrostatic testing will be condemned immediately for safety reasons as mandated by PESO and BIS
            regulations. Condemned cylinders will not be refilled or re-pressurized under any circumstances.
          </div>
        </section>

        {/* Section 4 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <FileText className="w-5 h-5" /> 4. Annual Maintenance Contracts (AMC) & Form B Certificates
          </div>
          <p>
            Under Section 3(3) of the Maharashtra Fire Safety Act, premises owners/occupiers must submit &ldquo;Form
            B&rdquo; biannually to the nominated Chief Fire Officer (in January and July).
          </p>
          <ul className="list-disc list-inside space-y-1 text-steel">
            <li>Form B certificates are issued strictly upon physical on-site inspection and rectification of all logged safety deviations.</li>
            <li>Client must provide uninterrupted access to riser shafts, pump rooms, overhead fire tanks, and basement hydrant rings.</li>
            <li>If client fails to rectify critical defects (e.g. non-functional main diesel fire engine pump), Form B issuance will be withheld.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <Wrench className="w-5 h-5" /> 5. Commercial Quotations, Tax Invoices & Payment Terms
          </div>
          <p>
            All generated prices and quotation proposals are denominated in Indian Rupees (INR) and are subject to 18%
            GST (CGST 9% + SGST 9% for intra-state Maharashtra, or IGST 18% for inter-state deliveries).
          </p>
          <ul className="list-disc list-inside space-y-1 text-steel">
            <li>Quotation validity is 30 calendar days from the date of issue due to raw material and steel pricing index.</li>
            <li>Heavy systems (Hydrant / Sprinkler Installation) require a 50% advance mobilization fee before dispatch of engineering crews.</li>
            <li>Credit terms (Net 30 days) are granted exclusively to corporate clients holding active GSTIN with positive credit verification.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <AlertCircle className="w-5 h-5" /> 6. Dispute Resolution & Jurisdiction
          </div>
          <p className="text-steel">
            Any dispute, claim, or controversy arising out of equipment supply or installation contracts shall be
            referred to arbitration in Navi Mumbai under the Arbitration and Conciliation Act, 1996. The courts situated
            in Thane / Navi Mumbai, Maharashtra shall possess exclusive jurisdiction.
          </p>
        </section>
      </main>
    </>
  );
}
