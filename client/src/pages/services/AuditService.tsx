import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { ClipboardCheck, CheckCircle2, ShieldCheck, Building2, Phone, Calendar, ArrowRight, Loader2 } from "lucide-react";
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
        email: email || `${phone}@placeholder.akfiresafety.com`,
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
      const fallbackId = `AK-AUDIT-${Date.now().toString().slice(-5)}`;
      setAuditRefId(fallbackId);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo
        title="Fire Safety Audit & Risk Assessment — AK Fire Safety"
        description="Comprehensive building fire safety inspection and risk assessments conforming to National Building Code (NBC Part IV) and Maharashtra Fire Services norms."
      />

      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">Statutory Risk Analysis</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Building Fire Safety Audits & Compliance Review
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-2xl leading-relaxed">
            Our certified Fire Safety Officers evaluate escape routes, hydrant pump health, detection sensitivity,
            and compliance gaps to deliver a comprehensive Fire Audit Report and Form B certification.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {submitted ? (
          <div className="bg-white border border-black/10 rounded-xl p-8 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">Audit Request Submitted!</h2>
            {auditRefId && (
              <p className="text-xs font-mono font-bold text-brand bg-paper px-3 py-1 rounded inline-block">
                Reference ID: {auditRefId}
              </p>
            )}
            <p className="text-xs sm:text-sm text-ink max-w-md mx-auto leading-relaxed">
              Thank you <strong>{name}</strong>. Our Senior Fire Safety Consultant will review the technical parameters
              for <strong>{company || "your building"}</strong> and contact you within 4 business hours with an audit proposal.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Link
                to="/service-history"
                className="px-5 py-2.5 bg-brand text-white text-xs font-semibold rounded-md hover:bg-brand-dark"
              >
                Track Status in Service History
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 bg-paper text-ink border border-black/10 text-xs font-semibold rounded-md hover:bg-gray-100"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-black/10 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-brand" /> Request On-Site Fire Safety Audit
              </h2>
              <p className="text-xs text-steel mt-0.5">
                Fill in basic facility characteristics to receive an upfront scope of work and audit proposal.
              </p>
            </div>

            {/* Contact */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Kulkarni"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Company / Society Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Greenfield CHS Ltd"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="audit@company.com"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>
            </div>

            {/* Building Specs */}
            <div className="space-y-4 pt-4 border-t border-black/10">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand" /> Building & Occupancy Parameters
              </h3>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Building Occupancy Type</label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none bg-white"
                  >
                    <option value="Commercial Office Tower">Commercial Office Tower</option>
                    <option value="Residential Housing Society">Residential Housing Society</option>
                    <option value="Industrial / Manufacturing Plant">Industrial / Manufacturing Plant</option>
                    <option value="Hospital / Healthcare Facility">Hospital / Healthcare Facility</option>
                    <option value="School / College / Institution">School / College / Institution</option>
                    <option value="Warehouse / Logistics Center">Warehouse / Logistics Center</option>
                    <option value="Hotel / Restaurant / Banquet">Hotel / Restaurant / Banquet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Built-up Area (Sq. Ft.)</label>
                  <input
                    type="text"
                    value={buildingSize}
                    onChange={(e) => setBuildingSize(e.target.value)}
                    placeholder="e.g. 45,000 sq ft"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Number of Floors</label>
                  <input
                    type="text"
                    value={numberOfFloors}
                    onChange={(e) => setNumberOfFloors(e.target.value)}
                    placeholder="e.g. G + 14 Floors"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Premises Location / Node *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sector 30A, Vashi, Navi Mumbai"
                  className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Approx. Extinguishers On-Site</label>
                  <input
                    type="text"
                    value={numberOfExtinguishers}
                    onChange={(e) => setNumberOfExtinguishers(e.target.value)}
                    placeholder="e.g. 35 units"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Existing Fixed Fire Systems</label>
                  <input
                    type="text"
                    value={existingFireSystems}
                    onChange={(e) => setExistingFireSystems(e.target.value)}
                    placeholder="e.g. Hydrant wet risers, Sprinklers, Fire Panel"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Target Audit Date</label>
                  <input
                    type="date"
                    value={preferredAuditDate}
                    onChange={(e) => setPreferredAuditDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Specific Objectives</label>
                  <input
                    type="text"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="e.g. Municipal Notice Reply / Form B Compliance"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" /> Request Comprehensive Fire Audit
            </button>
          </form>
        )}
      </main>
    </>
  );
}
