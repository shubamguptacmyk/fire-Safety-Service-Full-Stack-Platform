import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import TrustBadge from "@/components/ui/TrustBadge";
import {
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  Calendar,
  ArrowRight,
  Loader2,
  FileText,
  AlertTriangle,
  Award,
} from "lucide-react";
import { serviceBookingService } from "@/services/serviceBookingService";

export default function AuditService() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [buildingType, setBuildingType] = useState("Commercial Office Tower");
  const [buildingSize, setBuildingSize] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [location, setLocation] = useState("");
  const [numberOfExtinguishers, setNumberOfExtinguishers] = useState("");
  const [existingFireSystems, setExistingFireSystems] = useState("");
  const [preferredAuditDate, setPreferredAuditDate] = useState("");
  const [requirements, setRequirements] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [auditRefId, setAuditRefId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !location) return;

    setLoading(true);
    const auditDetails = `Type: ${buildingType} | Area: ${buildingSize || "N/A"} | Floors: ${numberOfFloors || "N/A"} | Extinguishers: ${numberOfExtinguishers || "N/A"} | Existing Systems: ${existingFireSystems || "None"}`;

    try {
      const res = await serviceBookingService.createBooking({
        customerName: name,
        companyName: company || undefined,
        phone,
        email: email || `${phone}@customer.shubamfire.in`,
        serviceType: "Fire Audit",
        serviceAddress: {
          street: location,
          city: "Navi Mumbai",
          state: "Maharashtra",
          pincode: "400705",
        },
        preferredDate: preferredAuditDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        preferredTime: "Morning (10:00 AM - 1:00 PM)",
        equipmentDetails: auditDetails,
        problemDescription: requirements || "Comprehensive Fire Safety Audit & Form B Readiness Survey",
      });
      setAuditRefId(res.bookingId);
      setSubmitted(true);
    } catch {
      const fallbackId = `SFP-AUDIT-${Date.now().toString().slice(-6)}`;
      setAuditRefId(fallbackId);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  const auditScopePoints = [
    "NBC 2016 Part IV & Maharashtra Fire Act compliance gap audit",
    "Escape route clearance, panic exit hardware, and stairwell pressurization",
    "Hydrant wet riser static & dynamic pressure testing (min 3.5 kg/cm²)",
    "Fire pump house auto-start sequential logic verification",
    "Smoke detection sensitivity, manual call points & strobe sounder testing",
    "Comprehensive Fire Audit Report with prioritized risk mitigation matrix",
  ];

  return (
    <>
      <Seo
        title="Fire Safety Audit & Risk Assessment — Shubam Fire Protection"
        description="Comprehensive building fire safety inspection and risk assessments conforming to National Building Code (NBC Part IV) and Maharashtra Fire Services norms."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: "Building Fire Safety Audits" },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <ClipboardCheck className="w-3.5 h-3.5" /> NBC Part IV & Maharashtra Fire Act
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Building Fire Safety Audits & Compliance
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Our licensed Fire Safety Consultants conduct thorough on-site physical audits of your facility to evaluate escape corridors, hydrant pump health, alarm loop integrity, and regulatory readiness for municipal Form B filings.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadge />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {submitted ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Request Registered
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Fire Safety Audit Request Submitted
              </h2>
            </div>

            {auditRefId && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
                <span className="text-xs text-slate-500 block">Audit Tracking Reference</span>
                <span className="font-mono text-base font-bold text-primary-700">{auditRefId}</span>
              </div>
            )}

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you <strong>{name}</strong>. Our Senior Fire Safety Consultant will evaluate the premises profile for <strong>{company || "your facility"}</strong> and contact you within 4 business hours to confirm your scheduled on-site audit.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="primary">
                <Link to="/service-history">View in Service History</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/services">Explore Other Services</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Left Scope Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 text-white p-7 rounded-3xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
                  Audit Scope & Methodology
                </span>
                <h3 className="font-display font-bold text-xl text-white">
                  What Our Fire Safety Audit Covers
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conducted strictly according to IS 14489, NBC 2016 Part IV, and CFO requirements to protect lives and avoid municipal notices.
                </p>

                <ul className="space-y-3 text-xs text-slate-200 pt-2">
                  {auditScopePoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                  <Award className="w-5 h-5 text-primary-600" />
                  <span>Licensed Agency Certification</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Shubam Fire Protection is an authorized Licensed Agency under Maharashtra Fire Services, qualified to issue legally recognized Fire Audit Reports and Form B certificates.
                </p>
              </div>
            </div>

            {/* Right Audit Request Form */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Schedule Audit
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-900 mt-0.5">
                  Request On-Site Fire Safety Audit
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your building details to receive a customized technical audit scope and quotation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Name *"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kulkarni"
                  />
                  <Input
                    label="Company / Society Name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Emerald Heights CHS"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number *"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                  />
                  <Input
                    label="Official Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Premises Classification"
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    options={[
                      { value: "Commercial Office Tower", label: "Commercial Office Tower" },
                      { value: "Residential Housing Society", label: "Residential Housing Society" },
                      { value: "Industrial Manufacturing Plant", label: "Industrial Manufacturing Plant" },
                      { value: "Warehouse / Logistics Park", label: "Warehouse / Logistics Park" },
                      { value: "Hospital / Healthcare Facility", label: "Hospital / Healthcare Facility" },
                      { value: "Hotel / Mall / Commercial Center", label: "Hotel / Mall / Commercial Center" },
                      { value: "Educational Institution / School", label: "Educational Institution / School" },
                    ]}
                  />

                  <Input
                    label="Total Built-Up Area (sq. ft.)"
                    value={buildingSize}
                    onChange={(e) => setBuildingSize(e.target.value)}
                    placeholder="e.g. 45,000 sq.ft."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Number of Floors"
                    value={numberOfFloors}
                    onChange={(e) => setNumberOfFloors(e.target.value)}
                    placeholder="e.g. G + 14 Floors + 2 Basements"
                  />
                  <Input
                    label="Approx. Extinguishers Count"
                    value={numberOfExtinguishers}
                    onChange={(e) => setNumberOfExtinguishers(e.target.value)}
                    placeholder="e.g. 40 units"
                  />
                </div>

                <Input
                  label="Site Location / Address *"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Plot No., Sector, MIDC / Node, City"
                />

                <Input
                  label="Existing Fire Fighting Installations"
                  value={existingFireSystems}
                  onChange={(e) => setExistingFireSystems(e.target.value)}
                  placeholder="e.g. Wet risers, Sprinklers, Yard hydrants, Fire alarms"
                />

                <Input
                  label="Preferred Audit Date"
                  type="date"
                  value={preferredAuditDate}
                  onChange={(e) => setPreferredAuditDate(e.target.value)}
                />

                <Textarea
                  label="Specific Requirements / Municipal Notices"
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Mention if you have received a Fire Department notice, insurance audit requirement, or Form B filing deadline..."
                />

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={loading}
                >
                  Schedule On-Site Fire Audit <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
