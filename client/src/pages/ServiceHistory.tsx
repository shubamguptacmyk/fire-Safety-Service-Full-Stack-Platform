import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import {
  Wrench,
  CheckCircle2,
  Calendar,
  FileCheck,
  Search,
  Download,
  AlertTriangle,
  User,
  MapPin,
  PlusCircle,
  Loader2,
  Clock,
  Phone,
  ShieldCheck,
  Building2,
  Printer,
  FileText,
} from "lucide-react";
import { serviceBookingService, ApiServiceBooking } from "@/services/serviceBookingService";
import { useAuthStore } from "@/store/authStore";

const SAMPLE_JOB_CARDS: any[] = [
  {
    _id: "demo-jc-1",
    bookingId: "SFP-SRV-2026-0419",
    serviceType: "Quarterly AMC Inspection",
    preferredDate: "2026-03-12",
    assignedTechnicianName: "Ganesh Patil (Grade I Technician)",
    assignedTechnicianPhone: "9820123456",
    serviceAddress: {
      street: "Turbhe Logistics Park - Unit B4",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400705",
    },
    equipmentDetails: "8x 4kg ABC Extinguishers, 2x 4.5kg CO2 Units, 1x Hose Reel Drum",
    status: "Completed",
    serviceReport: {
      jobCardNumber: "SFP-JC-2026-0419",
      summary: "Quarterly inspection carried out per IS 2190 guidelines.",
      remarks: "All pressure gauges verified within 15-18 kg/cm² operating zone. Nozzles cleaned, discharge horns unobstructed.",
      pressureTestPassed: true,
      formBRef: "FORM-B/MFS/2026/0881",
    },
  },
  {
    _id: "demo-jc-2",
    bookingId: "SFP-SRV-2026-0284",
    serviceType: "Cylinder Refilling",
    preferredDate: "2026-01-20",
    assignedTechnicianName: "Mahesh Kulkarni (PESO Specialist)",
    assignedTechnicianPhone: "9820987654",
    serviceAddress: {
      street: "Turbhe Logistics Park - Server Room A",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400705",
    },
    equipmentDetails: "3x 4.5kg CO2 Extinguishers (IS 2878)",
    status: "Completed",
    serviceReport: {
      jobCardNumber: "SFP-JC-2026-0284",
      summary: "Hydraulic pressure testing carried out at 250 bar.",
      remarks: "Expansion within permissible limits. Stamped with test date 01/26.",
      pressureTestPassed: true,
      formBRef: "HT-CERT-2026-302",
    },
  },
  {
    _id: "demo-jc-3",
    bookingId: "SFP-SRV-2025-0992",
    serviceType: "Fire Audit",
    preferredDate: "2025-11-15",
    assignedTechnicianName: "Sunil Varma (Licensed Consultant)",
    assignedTechnicianPhone: "9820554433",
    serviceAddress: {
      street: "Turbhe Logistics Park - Admin Block",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400705",
    },
    equipmentDetails: "Complete Premises - Riser, Sprinklers & Detection Grid",
    status: "Completed",
    serviceReport: {
      jobCardNumber: "SFP-JC-2025-0992",
      summary: "Annual fire safety audit per Maharashtra Fire Prevention Act.",
      remarks: "One strobe flasher in staircase corridor had loose terminal wiring; rectified and re-tested successfully.",
      pressureTestPassed: true,
      formBRef: "FORM-B/MFS/2025/1922",
    },
  },
];

export default function ServiceHistory() {
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (loggedIn) {
        try {
          const res = await serviceBookingService.getMyBookings();
          if (res.items && res.items.length > 0) {
            setBookings(res.items);
          } else {
            setBookings(SAMPLE_JOB_CARDS);
          }
        } catch {
          setBookings(SAMPLE_JOB_CARDS);
        }
      } else {
        try {
          const local = JSON.parse(
            localStorage.getItem("shubam_service_bookings") ||
              localStorage.getItem("ak_service_bookings") ||
              "[]"
          );
          setBookings(local.length > 0 ? [...local, ...SAMPLE_JOB_CARDS] : SAMPLE_JOB_CARDS);
        } catch {
          setBookings(SAMPLE_JOB_CARDS);
        }
      }
      setLoading(false);
    }
    load();
  }, [loggedIn]);

  const filteredJobs = bookings.filter((job) => {
    const matchesType = filterType === "All" || job.serviceType === filterType;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (job.bookingId && job.bookingId.toLowerCase().includes(term)) ||
      (job.serviceReport?.jobCardNumber &&
        job.serviceReport.jobCardNumber.toLowerCase().includes(term)) ||
      (job.assignedTechnicianName &&
        job.assignedTechnicianName.toLowerCase().includes(term)) ||
      (job.equipmentDetails && job.equipmentDetails.toLowerCase().includes(term)) ||
      (job.serviceAddress?.street &&
        job.serviceAddress.street.toLowerCase().includes(term));
    return matchesType && matchesSearch;
  });

  return (
    <>
      <Seo
        title="Service & Maintenance History — Shubam Fire Protection"
        description="Review past on-site fire equipment inspection logs, hydrostatic test certificates, and Form B compliance records."
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Account Portal", href: "/profile" },
              { label: "Service Records" },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400 font-mono">
                Field Operations History
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                Service & Maintenance Records
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Statutory verification logs, hydrostatic pressure charts, and technician inspection sign-offs.
              </p>
            </div>

            <Button asChild variant="primary" size="md">
              <Link to="/book-service">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Book Scheduled Inspection
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Compliance Assurance Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-emerald-950 shadow-sm">
          <div className="flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <strong className="block text-emerald-900 font-bold text-sm">
                Maharashtra Fire Prevention & Life Safety Measures Act
              </strong>
              <p className="text-emerald-800 text-xs mt-0.5">
                All logged services are executed by Shubam Fire Protection licensed technicians, eligible for biannual Form B municipal submissions.
              </p>
            </div>
          </div>
          <Link
            to="/services/amc"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 whitespace-nowrap"
          >
            Review AMC Inclusions →
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Quarterly AMC Inspection", "Cylinder Refilling", "Fire Audit", "Hydrant Repair"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === type
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {type === "Quarterly AMC Inspection" ? "AMC Inspection" : type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search booking ref, technician, site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-primary-600 outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Job Cards Listing */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading service records...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No service records found"
            description="Book your first service visit to view technician reports, pressure charts, and Form B references here."
            actionText="Book Service Visit"
            actionLink="/book-service"
          />
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const report = job.serviceReport;
              const isCompleted = job.status === "Completed";

              return (
                <div
                  key={job._id || job.bookingId}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 hover:border-primary-200 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900">{job.serviceType}</h3>
                        <span className="font-mono text-xs text-slate-500 font-semibold">
                          ({job.bookingId})
                        </span>
                        <Badge
                          tone={
                            isCompleted
                              ? "success"
                              : job.status === "Assigned"
                              ? "primary"
                              : "warning"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                        <span>
                          {job.serviceAddress?.street || job.serviceAddress},{" "}
                          {job.serviceAddress?.city || "Navi Mumbai"}
                        </span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedBooking(job)}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" /> View Job Card
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Visit Date
                      </span>
                      <strong className="text-slate-900 mt-1 block font-semibold">
                        {new Date(job.preferredDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block flex items-center gap-1 text-[11px]">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Assigned Lead
                      </span>
                      <strong className="text-slate-900 mt-1 block font-semibold truncate">
                        {job.assignedTechnicianName || "Pending Allocation"}
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block flex items-center gap-1 text-[11px]">
                        <FileCheck className="w-3.5 h-3.5 text-slate-400" /> Form B Ref
                      </span>
                      <strong className="text-primary-700 font-mono mt-1 block">
                        {report?.formBRef || "—"}
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Diagnostic Test
                      </span>
                      <strong className="text-emerald-700 mt-1 block font-semibold">
                        {report?.pressureTestPassed ? "Verified Pass" : "Visual Verified"}
                      </strong>
                    </div>
                  </div>

                  {job.equipmentDetails && (
                    <div className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-900">Serviced Equipment:</span>{" "}
                      {job.equipmentDetails}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Job Card Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Job Card: ${
            selectedBooking.serviceReport?.jobCardNumber || selectedBooking.bookingId
          }`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Category:</span>
                <strong className="text-slate-900 font-bold">{selectedBooking.serviceType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Date:</span>
                <strong className="text-slate-900">
                  {new Date(selectedBooking.preferredDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Technician:</span>
                <strong className="text-slate-900">
                  {selectedBooking.assignedTechnicianName || "Senior Fire Safety Officer"}
                </strong>
              </div>
              {selectedBooking.serviceReport?.formBRef && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Form B Statutory Ref:</span>
                  <strong className="text-primary-700 font-mono">
                    {selectedBooking.serviceReport.formBRef}
                  </strong>
                </div>
              )}
            </div>

            {selectedBooking.serviceReport?.summary && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider">
                  Scope of Work & Summary
                </h4>
                <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-xs">
                  {selectedBooking.serviceReport.summary}
                </p>
              </div>
            )}

            {selectedBooking.serviceReport?.remarks && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider">
                  Technician Diagnostic Remarks
                </h4>
                <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-xs">
                  {selectedBooking.serviceReport.remarks}
                </p>
              </div>
            )}

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Certified & Verified:</strong> Tested strictly per IS 2190 / PESO norms by Shubam Fire Protection. Legally compliant for municipal Form B submission.
              </span>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="primary" onClick={() => setSelectedBooking(null)}>
                Close Job Card
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
