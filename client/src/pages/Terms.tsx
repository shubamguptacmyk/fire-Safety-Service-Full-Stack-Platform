import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import TrustBadge from "@/components/ui/TrustBadge";
import { ShieldCheck, Scale, FileText, AlertCircle, Wrench, RefreshCw } from "lucide-react";

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Service & Commercial Policy — Shubam Fire Protection"
        description="Statutory terms of sale, equipment warranty, AMC service agreements, and Form B compliance liability disclaimers."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[{ label: "Terms of Service" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
            <Scale className="w-3.5 h-3.5" /> Legal & Regulatory Governance
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Terms of Service & Commercial Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Last Updated: January 2026 • Governed by Maharashtra Fire Prevention & Life Safety Measures Act, 2006
          </p>
        </div>
      </section>

      <TrustBadge />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <Scale className="w-5 h-5 text-primary-600" /> 1. Overview & Regulatory Jurisdiction
          </div>
          <p>
            Shubam Fire Protection (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) operates as a licensed
            fire protection equipment distributor, hydraulic testing facility, and certified engineering service
            provider in Navi Mumbai, Maharashtra, India.
          </p>
          <p>
            By procuring equipment, engaging AMC maintenance, or submitting quotation requests through this platform, you
            (&ldquo;Client&rdquo;, &ldquo;Premises Occupier&rdquo;) agree to be bound by these Terms, the Indian
            Contract Act 1872, and the Maharashtra Fire Prevention and Life Safety Measures Act, 2006.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-primary-600" /> 2. Equipment Standards & Warranty
          </div>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>
              <strong className="text-slate-900">BIS / ISI Certification:</strong> All portable fire extinguishers supplied
              carry valid Bureau of Indian Standards licenses (IS 15683 for portable extinguishers, IS 2878 for CO2,
              IS 5290 for landing valves).
            </li>
            <li>
              <strong className="text-slate-900">Warranty Period:</strong> New fire extinguishers carry a 12-month
              workmanship warranty from the date of invoice. Electronic smoke alarms and sounders carry a 24-month
              limited manufacturer warranty.
            </li>
            <li>
              <strong className="text-slate-900">Voiding of Warranty:</strong> Warranty is nullified if the tamper seal,
              safety pin, or pressure gauge seal is broken by non-certified third parties, or if apparatus is stored in
              corrosive, acidic, or unshaded environments exceeding 55°C.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <RefreshCw className="w-5 h-5 text-primary-600" /> 3. Refilling, Hydro-Testing & Cylinder Condemnation
          </div>
          <p>
            Under IS 2190:2010 codes of practice, all fire extinguishers must undergo periodic hydrostatic pressure
            testing (portable ABC at 35 kg/cm², CO2 cylinders at 250 bar hydraulic test).
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950">
            <strong className="block font-bold mb-1">Mandatory Condemnation Notice:</strong>
            Any pressure vessel exhibiting wall thinning exceeding 10%, deep pitting corrosion, or structural neck bulge
            during hydrostatic testing will be condemned immediately for safety reasons as mandated by PESO and BIS
            regulations. Condemned cylinders will not be refilled or re-pressurized under any circumstances.
          </div>
        </section>

        {/* Section 4 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <FileText className="w-5 h-5 text-primary-600" /> 4. Annual Maintenance Contracts (AMC) & Form B Certificates
          </div>
          <p>
            Under Section 3(3) of the Maharashtra Fire Safety Act, premises owners/occupiers must submit &ldquo;Form
            B&rdquo; biannually to the nominated Chief Fire Officer (in January and July).
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Form B certificates are issued strictly upon physical on-site inspection and rectification of all logged safety deviations.</li>
            <li>Client must provide uninterrupted access to riser shafts, pump rooms, overhead fire tanks, and basement hydrant rings.</li>
            <li>If client fails to rectify critical defects (e.g. non-functional main diesel fire engine pump), Form B issuance will be withheld.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <Wrench className="w-5 h-5 text-primary-600" /> 5. Commercial Quotations & Invoicing
          </div>
          <p>
            All generated prices and quotation proposals are denominated in Indian Rupees (INR) and are subject to 18%
            GST (CGST 9% + SGST 9% for intra-state Maharashtra, or IGST 18% for inter-state deliveries).
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Quotation validity is 30 calendar days from the date of issue due to raw material and steel pricing index.</li>
            <li>Heavy systems (Hydrant / Sprinkler Installation) require a 50% advance mobilization fee before dispatch of engineering crews.</li>
            <li>Credit terms (Net 30 days) are granted exclusively to corporate clients holding active GSTIN with positive credit verification.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <AlertCircle className="w-5 h-5 text-primary-600" /> 6. Dispute Resolution & Jurisdiction
          </div>
          <p className="text-slate-600">
            Any dispute, claim, or controversy arising out of equipment supply or installation contracts shall be
            referred to arbitration in Navi Mumbai under the Arbitration and Conciliation Act, 1996. The courts situated
            in Thane / Navi Mumbai, Maharashtra shall possess exclusive jurisdiction.
          </p>
        </section>
      </main>
    </>
  );
}
