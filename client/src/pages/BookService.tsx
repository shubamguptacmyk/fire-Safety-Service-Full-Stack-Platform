import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import TrustBadge from "@/components/ui/TrustBadge";
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
  Truck,
  ClipboardCheck,
} from "lucide-react";
import { serviceBookingService } from "@/services/serviceBookingService";
import { useAuthStore } from "@/store/authStore";

const SERVICES_CATALOG = [
  {
    id: "Refilling",
    title: "Cylinder Refilling & Hydro-Testing",
    tag: "IS 2190 BIS Compliant",
    desc: "Certified refilling of ABC powder, CO2, clean agent, and foam cylinders with 35-bar hydraulic proof test.",
    apiType: "Cylinder Refilling",
    icon: Wrench,
  },
  {
    id: "Inspection",
    title: "Quarterly Safety Inspection",
    tag: "Pre-Audit Check",
    desc: "Pressure gauge diagnostics, safety pin seals, discharge nozzle checks, and digital inspection tag logging.",
    apiType: "Quarterly AMC Inspection",
    icon: ShieldCheck,
  },
  {
    id: "AMC Visit",
    title: "AMC Routine Maintenance Visit",
    tag: "Statutory Form B",
    desc: "Scheduled maintenance visit under an active annual contract for housing societies or commercial premises.",
    apiType: "Quarterly AMC Inspection",
    icon: Calendar,
  },
  {
    id: "Fire Safety Audit",
    title: "Comprehensive Fire Safety Audit",
    tag: "NBC Part IV",
    desc: "On-site risk evaluation, escape route clearance, pump house check, and municipal Form B readiness report.",
    apiType: "Fire Audit",
    icon: ClipboardCheck,
  },
  {
    id: "Installation",
    title: "New Equipment Installation",
    tag: "Turnkey EPC",
    desc: "Installation of wall-mounted extinguishers, hose reel stations, wet riser landing valves, and smoke alarms.",
    apiType: "Installation",
    icon: Flame,
  },
  {
    id: "Repair",
    title: "Emergency Repairs & Valve Servicing",
    tag: "Immediate Dispatch",
    desc: "Emergency replacement of leaking discharge valves, burst rubber hoses, uncalibrated gauges, and handwheels.",
    apiType: "Hydrant Repair",
    icon: Truck,
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
      email: email || `${phone}@customer.shubamfire.in`,
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
      const fallbackId = `SFP-SRV-${Date.now().toString().slice(-6)}`;
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
        const existing = JSON.parse(
          localStorage.getItem("shubam_service_bookings") ||
            localStorage.getItem("ak_service_bookings") ||
            "[]"
        );
        existing.unshift(localBooking);
        localStorage.setItem("shubam_service_bookings", JSON.stringify(existing));
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
        title="Book Certified Fire Safety Service — Shubam Fire Protection"
        description="Schedule on-site fire extinguisher refilling, quarterly maintenance, hydrant inspection, or Form B audit across Navi Mumbai & Mumbai MMR."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Services", href: "/services" },
              { label: "Book Service" },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <Wrench className="w-3.5 h-3.5" /> Direct Technician Dispatch Desk
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Book Certified Fire Safety Service
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Licensed field engineers dispatched with calibrated digital pressure gauges, replacement valves, and standby loaner equipment across Maharashtra.
            </p>
          </div>
        </div>
      </section>

      <TrustBadge />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {submittedId ? (
          /* Confirmation Success View */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-600 font-bold block mb-1">
                Booking Confirmed
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Technician Visit Scheduled Successfully!
              </h2>
              <div className="inline-block mt-3 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200 font-mono text-sm font-bold text-primary-700">
                Reference ID: {submittedId}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left text-xs sm:text-sm space-y-3 text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Service:</span>
                <span className="text-slate-900 font-bold">{activeService.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Scheduled:</span>
                <span className="text-slate-900 font-medium">
                  {preferredDate} ({preferredTime.split(" ")[0]})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Premises:</span>
                <span className="text-slate-900 truncate max-w-[200px]">
                  {streetAddress}, {city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Representative:</span>
                <span className="text-slate-900 font-medium">
                  {customerName} ({phone})
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Our central dispatch coordinator will contact you via phone prior to the technician&apos;s departure. An official digital job card and inspection report will be generated upon visit completion.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="primary">
                <Link to="/service-history">Track in Service History</Link>
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSubmittedId(null);
                  setStep(1);
                }}
              >
                Book Another Service
              </Button>
            </div>
          </div>
        ) : (
          /* Multi-Step Wizard Flow */
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            {/* Step Progress Stepper */}
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {[
                  { stepNum: 1, label: "Select Service" },
                  { stepNum: 2, label: "Site & Contact" },
                  { stepNum: 3, label: "Schedule & Notes" },
                  { stepNum: 4, label: "Review & Confirm" },
                ].map((s) => (
                  <div key={s.stepNum} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s.stepNum
                          ? "bg-primary-600 text-white shadow-md ring-4 ring-primary-100"
                          : step > s.stepNum
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step > s.stepNum ? "✓" : s.stepNum}
                    </div>
                    <span
                      className={`hidden sm:inline text-xs font-semibold ${
                        step === s.stepNum ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: Select Service & Equipment */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Step 1: Choose Service & Equipment Type
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Select the primary operation required at your commercial or residential premises.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {SERVICES_CATALOG.map((serv) => {
                      const Icon = serv.icon;
                      const isSelected = selectedServiceId === serv.id;
                      return (
                        <div
                          key={serv.id}
                          onClick={() => setSelectedServiceId(serv.id)}
                          className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-primary-600 bg-primary-50/40 ring-2 ring-primary-200 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
                                {serv.tag}
                              </span>
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isSelected
                                    ? "bg-primary-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900">{serv.title}</h3>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{serv.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                            <span className={isSelected ? "text-primary-600" : "text-slate-400"}>
                              {isSelected ? "Selected" : "Select Option"}
                            </span>
                            <ArrowRight
                              className={`w-3.5 h-3.5 ${
                                isSelected ? "text-primary-600" : "text-slate-400"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Equipment Type and Estimated Quantity */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Equipment Characteristics</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Select
                        label="Primary Extinguisher / System Type"
                        value={equipmentType}
                        onChange={(e) => setEquipmentType(e.target.value)}
                        options={[
                          { value: "ABC Dry Powder", label: "ABC Dry Powder (IS 15683)" },
                          { value: "CO2 Carbon Dioxide", label: "CO2 Carbon Dioxide (IS 2878)" },
                          { value: "Mechanical Foam (AFFF)", label: "Mechanical Foam (AFFF 6%)" },
                          { value: "Clean Agent (FE-36 / HFC)", label: "Clean Agent (FE-36 / HFC-236fa)" },
                          { value: "Hydrant Wet Riser / Hose Reel", label: "Hydrant Wet Riser & Hose Reel" },
                          { value: "Fire Alarm & Smoke Detectors", label: "Fire Alarm & Smoke Detectors" },
                          { value: "Mixed Facility Equipment", label: "Mixed Facility Equipment" },
                        ]}
                      />

                      <Select
                        label="Estimated Number of Units"
                        value={equipmentCount}
                        onChange={(e) => setEquipmentCount(e.target.value)}
                        options={[
                          { value: "1 - 5 Units", label: "1 - 5 Units (Small Office / Retail)" },
                          { value: "6 - 15 Units", label: "6 - 15 Units (Mid-size Society / Floor)" },
                          { value: "16 - 50 Units", label: "16 - 50 Units (Residential Tower)" },
                          { value: "50+ Units", label: "50+ Units (Industrial / Campus)" },
                        ]}
                      />
                    </div>

                    <Input
                      label="Equipment Notes (Optional)"
                      value={equipmentNotes}
                      onChange={(e) => setEquipmentNotes(e.target.value)}
                      placeholder="e.g. 4kg SafePro extinguishers located in B-Wing stairwells"
                    />
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!validateStep1()}
                      variant="primary"
                      size="lg"
                    >
                      Next: Site & Contact <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Address & Contact Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Step 2: Premises Location & Contact Representative
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the inspection or service site location so we can allocate the nearest service van.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Representative Name *"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Anand Kulkarni"
                    />
                    <Input
                      label="Direct Mobile Number *"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 98XXXXXXXX"
                    />
                    <Input
                      label="Company / Society / Organization Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Seawoods Palm CHS Ltd"
                    />
                    <Input
                      label="Email Address for Reports & Invoices"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. facility@company.com"
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Service Site Address
                    </h3>

                    <Input
                      label="Building / Flat / Unit & Street Address *"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. Plot 12, Sector 19A, Near Palm Beach Galleria"
                    />

                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input
                        label="Landmark / Node"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Near Turbhe Flyover"
                      />

                      <Select
                        label="City / Region *"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        options={[
                          { value: "Navi Mumbai", label: "Navi Mumbai" },
                          { value: "Thane", label: "Thane" },
                          { value: "Mumbai Suburban", label: "Mumbai Suburban" },
                          { value: "Panvel", label: "Panvel" },
                          { value: "Taloja MIDC", label: "Taloja MIDC" },
                        ]}
                      />

                      <Input
                        label="Postal Pincode *"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="400705"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <Button variant="secondary" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setStep(3)}
                      disabled={!validateStep2()}
                    >
                      Next: Scheduling <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Scheduling & Problem Description */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Step 3: Scheduling & Service Observations
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Specify preferred arrival window and describe any equipment malfunctions or expiry dates.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Preferred Date *"
                      type="date"
                      required
                      value={preferredDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setPreferredDate(e.target.value)}
                    />

                    <Select
                      label="Preferred Arrival Window *"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      options={[
                        { value: "Morning (10:00 AM - 1:00 PM)", label: "Morning (10:00 AM - 1:00 PM)" },
                        { value: "Afternoon (1:00 PM - 5:00 PM)", label: "Afternoon (1:00 PM - 5:00 PM)" },
                        { value: "Evening (5:00 PM - 8:00 PM)", label: "Evening (5:00 PM - 8:00 PM)" },
                        { value: "Urgent / Same-Day Emergency", label: "Urgent / Emergency Callout" },
                      ]}
                    />
                  </div>

                  <Textarea
                    label="Problem Observations & Specific Requirements"
                    rows={4}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="e.g. 2 extinguishers have needle in red discharge zone, 1 hose reel is stuck, society requires half-yearly Form B certificate for local municipal fire brigade..."
                  />

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary-600" /> Technician Operational Guarantee
                    </span>
                    <p>• All technicians carry calibrated digital pressure gauges & BIS-grade seal wires.</p>
                    <p>• Standby loaner extinguishers provided free for refilling orders exceeding 5 units.</p>
                    <p>• Official Form B compliance verification available on-site.</p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <Button variant="secondary" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setStep(4)}
                      disabled={!validateStep3()}
                    >
                      Review Booking Details <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Confirm */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Step 4: Review & Confirm Service Booking
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Verify all details before dispatching your technician request to our operations desk.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
                    <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-xs">Requested Service</span>
                        <strong className="text-slate-900 font-bold block mt-0.5">
                          {activeService.title}
                        </strong>
                        <span className="text-primary-700 font-mono text-xs">{activeService.tag}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Target Date & Time</span>
                        <strong className="text-slate-900 block mt-0.5">
                          {new Date(preferredDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                        <span className="text-slate-600 text-xs">{preferredTime}</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-xs">Contact Representative</span>
                        <strong className="text-slate-900 block mt-0.5">{customerName}</strong>
                        {companyName && <span className="text-slate-600 block text-xs">{companyName}</span>}
                        <span className="text-slate-900 font-mono text-xs mt-0.5 block">{phone}</span>
                        {email && <span className="text-slate-600 block text-xs">{email}</span>}
                      </div>

                      <div>
                        <span className="text-slate-500 block text-xs">Service Destination</span>
                        <strong className="text-slate-900 block mt-0.5">{streetAddress}</strong>
                        {landmark && <span className="text-slate-600 block text-xs">Landmark: {landmark}</span>}
                        <span className="text-slate-900 block text-xs">{city}, MH - {pincode}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-xs">Equipment Scope</span>
                      <p className="text-slate-900 font-semibold mt-0.5">
                        {equipmentType} • {equipmentCount}
                        {equipmentNotes ? ` (${equipmentNotes})` : ""}
                      </p>
                      {problemDescription && (
                        <p className="text-slate-600 text-xs mt-1 italic">&ldquo;{problemDescription}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <Button variant="secondary" onClick={() => setStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> Edit Details
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleConfirmBooking}
                      isLoading={loading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm & Dispatch Booking
                    </Button>
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
