import Seo from "@/components/Seo";
import { Shield, Lock, Eye, FileText, Database, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy — AK Fire Safety Service"
        description="Our policy regarding client data, building safety plans, GSTIN records, and equipment asset tracking under the DPDP Act."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Privacy & Data Governance Policy</h1>
          <p className="text-xs sm:text-sm text-steel mt-1">
            Last Updated: January 2026 • Compliant with India&apos;s Digital Personal Data Protection (DPDP) Act
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-sm text-ink/90 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <Shield className="w-5 h-5" /> 1. Commitment to Client Confidentiality
          </div>
          <p>
            AK Fire Safety Service (&ldquo;AK Fire Safety&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects the
            privacy of its residential society managers, industrial plant heads, corporate security officers, and
            individual homeowners. This policy details how we manage and safeguard your data when you use our platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <Database className="w-5 h-5" /> 2. Information We Collect
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-paper rounded-lg border border-black/5">
              <strong className="text-ink block text-sm mb-1">Corporate & Identity Data</strong>
              <p className="text-steel">
                Authorized representative name, official email address, mobile phone number, company legal entity name,
                and Indian Goods & Services Tax Identification Number (GSTIN).
              </p>
            </div>
            <div className="p-3 bg-paper rounded-lg border border-black/5">
              <strong className="text-ink block text-sm mb-1">Premises & Asset Data</strong>
              <p className="text-steel">
                Physical property address, floor layout schematics uploaded for fire audits, equipment serial numbers,
                hydrostatic test validity stamps, and Form B inspection logs.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <Eye className="w-5 h-5" /> 3. How Your Information Is Used
          </div>
          <ul className="list-disc list-inside space-y-2 text-steel">
            <li>
              <strong className="text-ink">Statutory Compliance Submissions:</strong> Compiling certified Form B
              inspection documentation for submission to Chief Fire Officers under the Maharashtra Fire Prevention Act.
            </li>
            <li>
              <strong className="text-ink">Safety Reminder Notifications:</strong> Sending automated email and SMS/WhatsApp
              alerts prior to the 1-year refilling expiry or 3-year/5-year hydrostatic pressure testing requirement.
            </li>
            <li>
              <strong className="text-ink">Logistics & Service Execution:</strong> Coordinating heavy cargo freight
              deliveries with licensed transport carriers and dispatching licensed field engineers for on-site AMC.
            </li>
            <li>
              <strong className="text-ink">Tax Invoicing:</strong> Generating GST compliant tax invoices with proper HSN
              breakdown, CGST, SGST, or IGST credits.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <Lock className="w-5 h-5" /> 4. Data Security & Non-Disclosure
          </div>
          <p>
            We implement industry-grade encryption (TLS 1.3 in transit and AES-256 at rest) for all stored records.
            Architectural floor layouts, evacuation maps, and hazard vulnerability reports submitted for fire audits are
            treated as <strong className="text-ink">Strictly Confidential Commercial Secrets</strong> and are never
            shared with non-affiliated marketing entities or public databases.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-brand font-display font-bold text-base">
            <Mail className="w-5 h-5" /> 5. Grievance Officer & Contact Details
          </div>
          <p className="text-steel">
            In compliance with the Information Technology Act 2000 and DPDP Act 2023, the details of our Data Grievance
            Officer are:
          </p>
          <div className="bg-paper p-4 rounded-lg border border-black/5 text-xs space-y-1">
            <p><strong>Officer:</strong> Grievance Redressal Officer</p>
            <p><strong>Entity:</strong> AK Fire Safety Service</p>
            <p><strong>Address:</strong> Sector 19, Vashi / Turbhe MIDC, Navi Mumbai, Maharashtra - 400705</p>
            <p><strong>Email:</strong> privacy@akfiresafety.example</p>
            <p><strong>Helpline:</strong> +91 98000 00000 (Mon-Sat, 9:30 AM to 6:30 PM IST)</p>
          </div>
        </section>
      </main>
    </>
  );
}
