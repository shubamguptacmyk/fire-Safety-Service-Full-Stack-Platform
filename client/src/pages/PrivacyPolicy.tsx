import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import TrustBadge from "@/components/ui/TrustBadge";
import { Shield, Lock, Eye, FileText, Database, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy & Data Governance Policy — Shubam Fire Protection"
        description="Our policy regarding client data, building safety plans, GSTIN records, and equipment asset tracking under the DPDP Act."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[{ label: "Privacy Policy" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
            <Lock className="w-3.5 h-3.5" /> DPDP Act 2023 Compliant
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Privacy & Data Governance Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Last Updated: January 2026 • Compliant with India&apos;s Digital Personal Data Protection (DPDP) Act
          </p>
        </div>
      </section>

      <TrustBadge />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <Shield className="w-5 h-5 text-primary-600" /> 1. Commitment to Client Confidentiality
          </div>
          <p>
            Shubam Fire Protection (&ldquo;Shubam Fire Protection&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects the
            privacy of its residential housing society managers, industrial plant heads, corporate security officers, and
            individual facility owners. This policy details how we manage and safeguard your data when you use our digital platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <Database className="w-5 h-5 text-primary-600" /> 2. Information We Collect
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <strong className="text-slate-900 block text-sm font-bold">Corporate & Identity Data</strong>
              <p className="text-slate-600 leading-relaxed">
                Authorized representative name, official email address, mobile phone number, company legal entity name,
                and Indian Goods & Services Tax Identification Number (GSTIN).
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <strong className="text-slate-900 block text-sm font-bold">Premises & Asset Data</strong>
              <p className="text-slate-600 leading-relaxed">
                Physical property address, floor layout schematics uploaded for fire audits, equipment serial numbers,
                hydrostatic test validity stamps, and Form B inspection logs.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <Eye className="w-5 h-5 text-primary-600" /> 3. How Your Information Is Used
          </div>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>
              <strong className="text-slate-900">Statutory Compliance Submissions:</strong> Compiling certified Form B
              inspection documentation for submission to Chief Fire Officers under the Maharashtra Fire Prevention Act.
            </li>
            <li>
              <strong className="text-slate-900">Safety Reminder Notifications:</strong> Sending automated email and SMS/WhatsApp
              alerts prior to the 1-year refilling expiry or 3-year/5-year hydrostatic pressure testing requirement.
            </li>
            <li>
              <strong className="text-slate-900">Logistics & Service Execution:</strong> Coordinating equipment freight
              deliveries with licensed transport carriers and dispatching licensed field engineers for on-site AMC.
            </li>
            <li>
              <strong className="text-slate-900">Tax Invoicing:</strong> Generating GST compliant tax invoices with proper HSN
              breakdown, CGST, SGST, or IGST credits.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <Lock className="w-5 h-5 text-primary-600" /> 4. Data Security & Non-Disclosure
          </div>
          <p>
            We implement industry-grade encryption (TLS 1.3 in transit and AES-256 at rest) for all stored records.
            Architectural floor layouts, evacuation maps, and hazard vulnerability reports submitted for fire audits are
            treated as <strong className="text-slate-900">Strictly Confidential Commercial Secrets</strong> and are never
            shared with non-affiliated marketing entities or public databases.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary-700 font-display font-bold text-base">
            <Mail className="w-5 h-5 text-primary-600" /> 5. Grievance Officer & Contact Details
          </div>
          <p className="text-slate-600">
            In compliance with the Information Technology Act 2000 and DPDP Act 2023, the details of our Data Grievance
            Officer are:
          </p>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
            <p><strong>Officer:</strong> Grievance Redressal Officer</p>
            <p><strong>Entity:</strong> Shubam Fire Protection</p>
            <p><strong>Address:</strong> Sector 19, Vashi / Turbhe MIDC, Navi Mumbai, Maharashtra - 400703</p>
            <p><strong>Email:</strong> privacy@shubamfire.in</p>
            <p><strong>Helpline:</strong> +91 98000 00000 (Mon-Sat, 9:00 AM to 6:30 PM IST)</p>
          </div>
        </section>
      </main>
    </>
  );
}
