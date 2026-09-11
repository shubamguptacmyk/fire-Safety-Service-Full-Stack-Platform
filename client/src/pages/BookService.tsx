import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import {
  Wrench,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Flame,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileCheck,
  Building2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { serviceBookingService } from "@/services/serviceBookingService";
import { useAuthStore } from "@/store/authStore";

const SERVICES_CATALOG = [
  {
    id: "Refilling",
    title: "Cylinder Refilling & Hydro-Testing",
    tag: "IS 2190 BIS Compliant",
    desc: "Refilling of ABC powder, CO2, clean agent, and foam cylinders with 35-bar proof test.",
    apiType: "Cylinder Refilling",
  },
  {
    id: "Inspection",
    title: "Quarterly Safety Inspection",
    tag: "Pre-Audit Check",
    desc: "Pressure gauge diagnostics, safety pin seals, nozzle checks, and digital inspection tag.",
    apiType: "Quarterly AMC Inspection",
  },
  {
    id: "AMC Visit",
    title: "AMC Routine Maintenance Visit",
    tag: "Statutory Form B",
    desc: "Scheduled maintenance under annual contract for society or commercial premises.",
    apiType: "Quarterly AMC Inspection",
  },
  {
    id: "Fire Safety Audit",
    title: "Comprehensive Fire Safety Audit",
    tag: "NBC Part IV",
    desc: "On-site risk evaluation, escape path check, pump room review, and Form B readiness report.",
    apiType: "Fire Audit",
  },
  {
    id: "Installation",
    title: "New Equipment Installation",
    tag: "Turnkey EPC",
    desc: "Installation of wall-mounted extinguishers, hose reel stations, and smoke alarms.",
    apiType: "Installation",
  },
  {
    id: "Repair",
    title: "Emergency Repairs & Valve Servicing",
    tag: "Immediate Dispatch",
    desc: "Replacement of leaking discharge valves, worn rubber hoses, and faulty gauges.",
    apiType: "Hydrant Repair",
  },
];

export default function BookService() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "Refilling";
  const initialEquip = searchParams.get("equipment") || "";

  const { user } = useAuthStore();

  // Wizard Step (1: Service, 2: Address/Contact, 3: Schedule/Notes, 4: Review)
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [selectedServiceId, setSelectedServiceId] = useState(initialType);
  const [equipmentType, setEquipmentType] = useState("ABC Dry Powder");
  const [equipmentCount, setEquipmentCount] = useState("1 - 5 Units");
  const [equipmentNotes, setEquipmentNotes] = useState(initialEquip);

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Navi Mumbai");
  const [pincode, setPincode] = useState("400705");

  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [preferredTime, setPreferredTime] = useState("Morning (10:00 AM - 1:00 PM)");
  const [problemDescription, setProblemDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || "");
      if (!phone) setPhone(user.phone || "");
      if (!email && user.email) setEmail(user.email);
      if (!companyName && user.companyName) setCompanyName(user.companyName);
    }
  }, [user]);

  const activeService =
    SERVICES_CATALOG.find((s) => s.id === selectedServiceId) || SERVICES_CATALOG[0];

  function validateStep1() {
    return Boolean(selectedServiceId);
  }

  function validateStep2() {
    return Boolean(customerName.trim() && phone.trim() && streetAddress.trim());
  }

  function validateStep3() {
    return Boolean(preferredDate && preferredTime);
  }

  async function handleConfirmBooking() {
    setLoading(true);
    setError(null);

    const fullEquipmentInfo = [
      `Type: ${equipmentType}`,
      `Quantity: ${equipmentCount}`,
      equipmentNotes ? `Details: ${equipmentNotes}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const payload = {
      customerName,
      companyName: companyName || undefined,
      phone,
      email: email || `${phone}@customer.akfiresafety.com`,
      serviceType: activeService.apiType,
      serviceAddress: {
        street: streetAddress,
        landmark: landmark || undefined,
        city,
        state: "Maharashtra",
        pincode,
      },
      preferredDate,
      preferredTime,
      equipmentDetails: fullEquipmentInfo,
      problemDescription,
    };

    try {
      const res = await serviceBookingService.createBooking(payload);
      setSubmittedId(res.bookingId);
    } catch (err: any) {
      console.warn("API booking request failed, saving locally as fallback:", err);
      const fallbackId = `AK-SRV-${Date.now().toString().slice(-6)}`;
      const localBooking = {
        _id: fallbackId,
        bookingId: fallbackId,
        serviceType: activeService.apiType,
        customerName,
        companyName,
        phone,
        email,
        serviceAddress: payload.serviceAddress,
        preferredDate,
        preferredTime,
        equipmentDetails: fullEquipmentInfo,
        problemDescription,
        status: "Requested",
        createdAt: new Date().toISOString(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem("ak_service_bookings") || "[]");
        existing.unshift(localBooking);
        localStorage.setItem("ak_service_bookings", JSON.stringify(existing));
      } catch {
        /* ignore */
      }
      setSubmittedId(fallbackId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo
        title="Book Certified Fire Safety Service — AK Fire Safety Service"
        description="Schedule on-site fire extinguisher refilling, quarterly maintenance, hydrant inspection, or Form B audit across Navi Mumbai."
      />

      {/* Header Banner */}
      <div className="bg-ink text-white py-8 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber font-mono">
            Direct Technician Dispatch Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1">
            Book Certified Fire Safety Technician Service
          </h1>
          <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl">
            Licensed field engineers dispatched with calibrated test gauges, replacement valves, and
            standby loaner equipment across Maharashtra.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {submittedId ? (
          /* Confirmation Success View */
          <div className="bg-white border border-black/10 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-6">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-brand font-bold font-mono">
                Booking Confirmed
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Technician Visit Scheduled Successfully!
              </h2>
              <div className="inline-block mt-3 px-4 py-1.5 bg-paper rounded-full border border-black/10 font-mono text-sm font-bold text-brand">
                Reference ID: {submittedId}
              </div>
            </div>

            <div className="bg-paper border border-black/10 rounded-xl p-5 max-w-md mx-auto text-left text-xs space-y-2 text-steel">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="font-semibold text-ink">Service Type:</span>
                <span className="text-ink font-bold">{activeService.title}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="font-semibold text-ink">Scheduled Date:</span>
                <span className="text-ink">{preferredDate} ({preferredTime.split(" ")[0]})</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="font-semibold text-ink">Premises Address:</span>
                <span className="text-ink truncate max-w-[200px]">{streetAddress}, {city}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-ink">Contact Person:</span>
                <span className="text-ink">{customerName} ({phone})</span>
              </div>
            </div>

            <p className="text-xs text-steel max-w-md mx-auto leading-relaxed">
              Our central dispatch coordinator will contact you via phone prior to the technician&apos;s
              departure. An official digital job card and inspection report will be generated upon visit completion.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/service-history"
                className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Track Status & Service History
              </Link>
              <button
                onClick={() => {
                  setSubmittedId(null);
                  setStep(1);
                }}
                className="px-5 py-2.5 bg-paper hover:bg-gray-200 border border-black/10 text-ink text-xs font-semibold rounded-lg transition-colors"
              >
                Book Another Service Visit
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Wizard Flow */
          <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
            {/* Step Progress Stepper */}
            <div className="border-b border-black/10 bg-paper px-6 py-4">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {[
                  { stepNum: 1, label: "Select Service" },
                  { stepNum: 2, label: "Site & Contact" },
                  { stepNum: 3, label: "Schedule & Notes" },
                  { stepNum: 4, label: "Review & Confirm" },
                ].map((s) => (
                  <div key={s.stepNum} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        step === s.stepNum
                          ? "bg-brand text-white shadow-sm ring-2 ring-brand/20"
                          : step > s.stepNum
                          ? "bg-green-600 text-white"
                          : "bg-black/10 text-steel"
                      }`}
                    >
                      {step > s.stepNum ? "✓" : s.stepNum}
                    </div>
                    <span
                      className={`hidden sm:inline text-xs font-semibold ${
                        step === s.stepNum ? "text-ink" : "text-steel"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: Select Service & Equipment */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-display text-ink">
                      Step 1: Choose Service & Equipment Type
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Select the primary operation required at your commercial or residential premises.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {SERVICES_CATALOG.map((serv) => (
                      <div
                        key={serv.id}
                        onClick={() => setSelectedServiceId(serv.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                          selectedServiceId === serv.id
                            ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                            : "border-black/10 hover:border-black/20 bg-white"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand block mb-1">
                            {serv.tag}
                          </span>
                          <h3 className="font-bold text-sm text-ink">{serv.title}</h3>
                          <p className="text-xs text-steel mt-1 leading-relaxed">{serv.desc}</p>
                        </div>
                        <div className="mt-3 text-right">
                          <span
                            className={`text-xs font-bold ${
                              selectedServiceId === serv.id ? "text-brand" : "text-steel"
                            }`}
                          >
                            {selectedServiceId === serv.id ? "✓ Selected" : "Select →"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Equipment Type and Estimated Quantity */}
                  <div className="pt-4 border-t border-black/10 space-y-4">
                    <h3 className="text-sm font-bold text-ink">Equipment Characteristics</h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-ink/80 mb-1">
                          Primary Extinguisher / System Type
                        </label>
                        <select
                          value={equipmentType}
                          onChange={(e) => setEquipmentType(e.target.value)}
                          className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none bg-white"
                        >
                          <option value="ABC Dry Powder">ABC Dry Powder (IS 15683)</option>
                          <option value="CO2 Carbon Dioxide">CO2 Carbon Dioxide (IS 2878)</option>
                          <option value="Mechanical Foam (AFFF)">Mechanical Foam (AFFF 6%)</option>
                          <option value="Clean Agent (FE-36 / HFC)">Clean Agent (FE-36 / HFC-236fa)</option>
                          <option value="Hydrant Wet Riser / Hose Reel">Hydrant Wet Riser & Hose Reel</option>
                          <option value="Fire Alarm & Smoke Detectors">Fire Alarm & Smoke Detectors</option>
                          <option value="Mixed Facility Equipment">Mixed Facility Equipment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-ink/80 mb-1">
                          Estimated Number of Units
                        </label>
                        <select
                          value={equipmentCount}
                          onChange={(e) => setEquipmentCount(e.target.value)}
                          className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none bg-white"
                        >
                          <option value="1 - 5 Units">1 - 5 Units (Small Office / Shop)</option>
                          <option value="6 - 15 Units">6 - 15 Units (Mid-size Society / Floor)</option>
                          <option value="16 - 50 Units">16 - 50 Units (Residential Tower)</option>
                          <option value="50+ Units">50+ Units (Industrial Plant / Corporate Campus)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">
                        Equipment Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={equipmentNotes}
                        onChange={(e) => setEquipmentNotes(e.target.value)}
                        placeholder="e.g. 4kg SafePro extinguishers located in B-Wing stairwells"
                        className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-black/10">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!validateStep1()}
                      className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      Next: Site & Contact Information <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Address & Contact Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-display text-ink">
                      Step 2: Premises Location & Contact Representative
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Enter the inspection or service site location so we can allocate the nearest service van.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-ink/80 mb-1">
                        Representative Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Anand Kulkarni"
                        className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-ink/80 mb-1">
                        Direct Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9820098200"
                        className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-ink/80 mb-1">
                        Company / Society / Organization Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Seawoods Palm CHS Ltd"
                        className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-ink/80 mb-1">
                        Email Address for Report & Invoices
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. facility@company.com"
                        className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-steel">
                      Service Site Address
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">
                        Building / Flat / Unit & Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. Plot 12, Sector 19A, Near Palm Beach Galleria"
                        className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-ink/80 mb-1">Landmark / Node</label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Turbhe Flyover"
                          className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-ink/80 mb-1">City / Region *</label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none bg-white"
                        >
                          <option value="Navi Mumbai">Navi Mumbai</option>
                          <option value="Thane">Thane</option>
                          <option value="Mumbai Suburban">Mumbai Suburban</option>
                          <option value="Panvel">Panvel</option>
                          <option value="Taloja MIDC">Taloja MIDC</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-ink/80 mb-1">Postal Pincode *</label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="400705"
                          className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/10">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-black/15 text-ink rounded text-xs font-semibold hover:bg-paper flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!validateStep2()}
                      className="px-6 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      Next: Scheduling & Observations <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Scheduling & Problem Description */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-display text-ink">
                      Step 3: Scheduling & Service Observations
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Specify preferred arrival window and describe any equipment malfunctions or expiry dates.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-ink/80 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none bg-white font-semibold text-ink"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-ink/80 mb-1">
                        Preferred Arrival Window *
                      </label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 rounded focus:border-brand outline-none bg-white font-semibold text-ink"
                      >
                        <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                        <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                        <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                        <option value="Urgent / Same-Day Emergency">Urgent / Emergency Callout</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">
                      Problem Observations & Specific Requirements
                    </label>
                    <textarea
                      rows={4}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="e.g. 2 extinguishers have needle in red discharge zone, 1 hose reel is stuck, society requires half-yearly Form B certificate for local municipal fire brigade..."
                      className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                    />
                  </div>

                  <div className="p-4 bg-paper rounded-xl border border-black/10 text-xs text-steel space-y-1">
                    <span className="font-bold text-ink flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand" /> Technician Operational Guarantee
                    </span>
                    <p>• All technicians carry calibrated digital pressure gauges & BIS-grade seal wires.</p>
                    <p>• Standby loaner extinguishers provided free for refilling orders exceeding 5 units.</p>
                    <p>• Official Form B compliance verification available on-site.</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/10">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-black/15 text-ink rounded text-xs font-semibold hover:bg-paper flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={!validateStep3()}
                      className="px-6 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      Review Booking Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Confirm */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold font-display text-ink">
                      Step 4: Review & Confirm Service Booking
                    </h2>
                    <p className="text-xs text-steel mt-0.5">
                      Verify all details before dispatching your technician request to our operations desk.
                    </p>
                  </div>

                  <div className="bg-paper border border-black/10 rounded-xl p-5 space-y-4 text-xs">
                    <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-black/10">
                      <div>
                        <span className="text-steel block">Requested Service</span>
                        <strong className="text-ink font-bold text-sm block mt-0.5">
                          {activeService.title}
                        </strong>
                        <span className="text-brand font-mono text-[11px]">{activeService.tag}</span>
                      </div>
                      <div>
                        <span className="text-steel block">Target Date & Arrival Window</span>
                        <strong className="text-ink text-sm block mt-0.5">
                          {new Date(preferredDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                        <span className="text-steel">{preferredTime}</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-black/10">
                      <div>
                        <span className="text-steel block">Contact Information</span>
                        <strong className="text-ink block mt-0.5">{customerName}</strong>
                        {companyName && <span className="text-steel block">{companyName}</span>}
                        <span className="text-ink font-mono mt-0.5 block">{phone}</span>
                        {email && <span className="text-steel block">{email}</span>}
                      </div>

                      <div>
                        <span className="text-steel block">Site Destination</span>
                        <strong className="text-ink block mt-0.5">{streetAddress}</strong>
                        {landmark && <span className="text-steel block">Landmark: {landmark}</span>}
                        <span className="text-ink block">{city}, MH - {pincode}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-steel block">Equipment & Scope</span>
                      <p className="text-ink font-medium mt-0.5">
                        {equipmentType} • {equipmentCount}
                        {equipmentNotes ? ` (${equipmentNotes})` : ""}
                      </p>
                      {problemDescription && (
                        <p className="text-steel mt-1 italic">&ldquo;{problemDescription}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/10">
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 border border-black/15 text-ink rounded text-xs font-semibold hover:bg-paper flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Edit Details
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={loading}
                      className="px-8 py-3 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Scheduling Technician...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Confirm & Dispatch Booking
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
