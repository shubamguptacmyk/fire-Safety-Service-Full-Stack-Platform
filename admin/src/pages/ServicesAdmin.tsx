import { useState, useEffect, useCallback } from "react";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  FileCheck,
  UserCheck,
  AlertCircle,
  Clock,
  Search,
  CheckCircle2,
  Plus,
  Loader2,
  Users,
  Bell,
  X,
  ExternalLink,
  Phone,
  RefreshCw,
} from "lucide-react";
import {
  adminOperationsService,
  AdminServiceBooking,
  AdminAMCContract,
  AdminTechnician,
} from "@/services/adminOperationsService";
import { useToast } from "@/store/toastStore";

export default function ServicesAdmin() {
  const [activeTab, setActiveTab] = useState<"tickets" | "amc" | "technicians" | "cron">("tickets");

  const [bookings, setBookings] = useState<AdminServiceBooking[]>([]);
  const [amcs, setAmcs] = useState<AdminAMCContract[]>([]);
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminServiceBooking | null>(null);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState<string>("Assigned");

  const [isJobCardModalOpen, setIsJobCardModalOpen] = useState(false);
  const [jobCardSummary, setJobCardSummary] = useState("");
  const [jobCardRemarks, setJobCardRemarks] = useState("");
  const [jobCardFormB, setJobCardFormB] = useState("");
  const [jobCardPressureTest, setJobCardPressureTest] = useState(true);

  const [isNewAMCModalOpen, setIsNewAMCModalOpen] = useState(false);
  const [newAMCClient, setNewAMCClient] = useState("");
  const [newAMCCompany, setNewAMCCompany] = useState("");
  const [newAMCPhone, setNewAMCPhone] = useState("");
  const [newAMCEmail, setNewAMCEmail] = useState("");
  const [newAMCPremises, setNewAMCPremises] = useState("Commercial / Warehousing");
  const [newAMCLocation, setNewAMCLocation] = useState("");
  const [newAMCPlan, setNewAMCPlan] = useState("Comprehensive Commercial AMC (Quarterly)");
  const [newAMCFrequency, setNewAMCFrequency] = useState<"Quarterly" | "Half-Yearly" | "Annual">("Quarterly");
  const [newAMCValue, setNewAMCValue] = useState("25000");

  const [isNewTechModalOpen, setIsNewTechModalOpen] = useState(false);
  const [newTechName, setNewTechName] = useState("");
  const [newTechPhone, setNewTechPhone] = useState("");
  const [newTechEmail, setNewTechEmail] = useState("");
  const [newTechEmployeeId, setNewTechEmployeeId] = useState("");
  const [newTechArea, setNewTechArea] = useState("Navi Mumbai");
  const [newTechLicense, setNewTechLicense] = useState("");

  // Cron Scan result
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, amcRes, techRes] = await Promise.all([
        adminOperationsService.listBookings(),
        adminOperationsService.listAMCContracts(),
        adminOperationsService.listTechnicians(),
      ]);
      setBookings(bookingsRes.items);
      setAmcs(amcRes.items);
      setTechnicians(techRes);
    } catch (err) {
      console.error("Failed to load operations data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toast = useToast();

  // Handle Technician Dispatch
  async function handleDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      await adminOperationsService.updateBookingStatus(selectedBooking._id, {
        status: dispatchStatus,
        assignedTechnician: selectedTechId || undefined,
        notes: `Admin assigned status ${dispatchStatus}`,
      });
      toast.success(`Service ticket dispatch updated to "${dispatchStatus}"`);
      setIsDispatchModalOpen(false);
      setSelectedBooking(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update dispatch");
    }
  }

  // Handle Sign Job Card
  async function handleSignJobCard(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      await adminOperationsService.submitJobCard(selectedBooking._id, {
        summary: jobCardSummary || "Comprehensive field inspection executed per standards.",
        remarks: jobCardRemarks || "Pressure gauges checked. Nozzles unobstructed.",
        formBRef: jobCardFormB || undefined,
        pressureTestPassed: jobCardPressureTest,
      });
      toast.success("Job card signed and submitted successfully!");
      setIsJobCardModalOpen(false);
      setSelectedBooking(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit job card");
    }
  }

  // Handle Create AMC Contract
  async function handleCreateAMC(e: React.FormEvent) {
    e.preventDefault();
    if (!newAMCClient || !newAMCPhone || !newAMCLocation) return;

    try {
      const startDate = new Date().toISOString().slice(0, 10);
      const endDate = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

      await adminOperationsService.createAMCContract({
        clientName: newAMCClient,
        companyName: newAMCCompany || undefined,
        phone: newAMCPhone,
        email: newAMCEmail || `${newAMCPhone}@client.akfiresafety.com`,
        premisesType: newAMCPremises,
        location: newAMCLocation,
        planName: newAMCPlan,
        frequency: newAMCFrequency,
        startDate,
        endDate,
        renewalDate: endDate,
        equipmentCount: 15,
        annualValue: parseFloat(newAMCValue) || 25000,
      });

      toast.success("Commercial AMC Contract registered successfully!");
      setIsNewAMCModalOpen(false);
      setNewAMCClient("");
      setNewAMCCompany("");
      setNewAMCPhone("");
      setNewAMCEmail("");
      setNewAMCLocation("");
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create AMC contract");
    }
  }

  // Handle Create Technician
  async function handleCreateTechnician(e: React.FormEvent) {
    e.preventDefault();
    if (!newTechName || !newTechPhone || !newTechEmployeeId) return;

    try {
      await adminOperationsService.createTechnician({
        name: newTechName,
        phone: newTechPhone,
        email: newTechEmail || `${newTechEmployeeId.toLowerCase()}@akfiresafety.com`,
        employeeId: newTechEmployeeId.toUpperCase(),
        skills: ["Extinguisher Refilling", "Hydro-Testing", "Form B Inspection"],
        serviceArea: newTechArea,
        licenseNumber: newTechLicense || "MFS-TECH-0491",
        status: "active",
      });

      toast.success(`Technician ${newTechName} registered into dispatch directory!`);
      setIsNewTechModalOpen(false);
      setNewTechName("");
      setNewTechPhone("");
      setNewTechEmail("");
      setNewTechEmployeeId("");
      setNewTechLicense("");
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register technician");
    }
  }

  // Handle Run Cron
  async function handleRunCron() {
    setCronRunning(true);
    try {
      const res = await adminOperationsService.triggerReminderScan();
      setCronResult(res);
      toast.success("Statutory AMC & Cylinder Reminder scan executed successfully!");
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error executing cron scan");
    } finally {
      setCronRunning(false);
    }
  }

  const filteredTickets = bookings.filter(
    (t) =>
      t.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAmcs = amcs.filter(
    (a) =>
      a.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTechs = technicians.filter(
    (tech) =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.serviceArea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">AMC & Field Service Operations</h1>
          <p className="text-xs text-steel mt-0.5">
            Real-time technician dispatches, statutory Form B certifications, and automated reminder engines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 border border-black/10 rounded-lg text-steel hover:text-ink bg-white shadow-xs"
            title="Refresh records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="flex items-center bg-white border border-black/10 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "tickets" ? "bg-brand text-white" : "text-steel hover:text-ink"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("amc")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "amc" ? "bg-brand text-white" : "text-steel hover:text-ink"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> AMC Contracts ({amcs.length})
            </button>
            <button
              onClick={() => setActiveTab("technicians")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "technicians" ? "bg-brand text-white" : "text-steel hover:text-ink"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Technicians ({technicians.length})
            </button>
            <button
              onClick={() => setActiveTab("cron")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "cron" ? "bg-brand text-white" : "text-steel hover:text-ink"
              }`}
            >
              <Bell className="w-3.5 h-3.5" /> Automated Cron
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Overview Metric Cards */}
      <div className="grid sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm">
          <span className="font-semibold text-steel block">Active AMC Contracts</span>
          <span className="text-2xl font-display font-bold text-ink mt-1 block">{amcs.length}</span>
          <p className="text-[11px] text-steel mt-0.5">Registered societies and industrial plants</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <span className="font-bold text-green-900 block">Form B Compliant</span>
          <span className="text-2xl font-display font-bold text-green-700 mt-1 block">
            {amcs.filter((a) => a.formBStatus === "Current").length}
          </span>
          <p className="text-[11px] text-green-800 mt-0.5">Certified compliant under Maharashtra Fire Act</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <span className="font-bold text-amber-900 block">Form B Due / Overdue</span>
          <span className="text-2xl font-display font-bold text-amber-800 mt-1 block">
            {amcs.filter((a) => a.formBStatus !== "Current").length}
          </span>
          <p className="text-[11px] text-amber-800 mt-0.5">Urgent compliance inspection visits required</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <span className="font-bold text-blue-900 block">Certified Field Staff</span>
          <span className="text-2xl font-display font-bold text-blue-700 mt-1 block">
            {technicians.filter((t) => t.status === "active").length} Active
          </span>
          <p className="text-[11px] text-blue-800 mt-0.5">Licensed Category A technicians</p>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "tickets"
                ? "Search tickets by ID, service type, customer..."
                : activeTab === "amc"
                ? "Search contracts by number, premises, or location..."
                : "Search technicians by name, employee ID, or area..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper/50 border border-black/10 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {activeTab === "amc" && (
          <button
            onClick={() => setIsNewAMCModalOpen(true)}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create AMC Contract
          </button>
        )}

        {activeTab === "technicians" && (
          <button
            onClick={() => setIsNewTechModalOpen(true)}
            className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Technician
          </button>
        )}
      </div>

      {/* TAB 1: Service Tickets */}
      {activeTab === "tickets" && (
        <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-2" />
              <span className="text-xs text-steel">Loading service tickets...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-xs text-steel">No service bookings match your search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Date & Slot</th>
                    <th className="p-3.5">Service Type</th>
                    <th className="p-3.5">Customer / Premises</th>
                    <th className="p-3.5">Assigned Technician</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-paper/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-ink">{t.bookingId}</td>
                      <td className="p-3.5 text-steel">
                        <div>{new Date(t.preferredDate).toLocaleDateString("en-IN")}</div>
                        <span className="text-[10px] text-steel/70">{t.preferredTime}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-ink">{t.serviceType}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-ink">{t.customerName}</div>
                        <span className="text-[11px] text-steel">{t.serviceAddress.city} · {t.phone}</span>
                      </td>
                      <td className="p-3.5">
                        {t.assignedTechnicianName ? (
                          <span className="font-semibold text-ink flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-brand" /> {t.assignedTechnicianName}
                          </span>
                        ) : (
                          <span className="text-steel italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            t.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : t.status === "Assigned" || t.status === "Technician On The Way"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {t.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(t);
                            setSelectedTechId(t.assignedTechnician?._id || "");
                            setDispatchStatus(t.status);
                            setIsDispatchModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-paper hover:bg-black/5 text-ink border border-black/10 rounded font-semibold text-xs"
                        >
                          Dispatch / Status
                        </button>
                        {t.status !== "Completed" && (
                          <button
                            onClick={() => {
                              setSelectedBooking(t);
                              setJobCardSummary(`On-site execution of ${t.serviceType} completed.`);
                              setJobCardRemarks("Extinguishers verified in operating green band.");
                              setJobCardFormB(`FORM-B/MFS/${new Date().getFullYear()}/${t.bookingId.slice(-4)}`);
                              setIsJobCardModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-xs transition-colors"
                          >
                            Sign Job Card
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AMC Contracts */}
      {activeTab === "amc" && (
        <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-2" />
              <span className="text-xs text-steel">Loading AMC contracts...</span>
            </div>
          ) : filteredAmcs.length === 0 ? (
            <div className="p-12 text-center text-xs text-steel">No AMC contracts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Contract ID</th>
                    <th className="p-3.5">Client / Premises</th>
                    <th className="p-3.5">AMC Tier</th>
                    <th className="p-3.5">Visits Done</th>
                    <th className="p-3.5">Renewal Date</th>
                    <th className="p-3.5">Form B Status</th>
                    <th className="p-3.5">Annual Fee</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredAmcs.map((amc) => (
                    <tr key={amc._id} className="hover:bg-paper/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-ink">{amc.contractNumber}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-ink">{amc.clientName}</div>
                        <span className="text-[11px] text-steel">{amc.location}</span>
                      </td>
                      <td className="p-3.5 text-ink font-medium">{amc.planName}</td>
                      <td className="p-3.5 text-ink font-semibold">
                        {amc.visitsCompleted} / {amc.visitsPerYear}
                      </td>
                      <td className="p-3.5 text-steel font-mono">
                        {new Date(amc.renewalDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            amc.formBStatus === "Current"
                              ? "bg-green-100 text-green-800"
                              : amc.formBStatus === "Due in 30 Days"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {amc.formBStatus}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-ink">
                        ₹{amc.annualValue.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={async () => {
                            const nextVisit = amc.visitsScheduled.find((v) => v.status === "Pending");
                            if (!nextVisit) {
                              toast.info("All scheduled visits are already completed for this period.");
                              return;
                            }
                            await adminOperationsService.recordAMCVisit(amc._id, {
                              visitNumber: nextVisit.visitNumber,
                              status: "Completed",
                              notes: "Routine quarterly inspection verified and signed off.",
                            });
                            toast.success(`Visit #${nextVisit.visitNumber} logged and marked completed!`);
                            await loadData();
                          }}
                          className="px-2.5 py-1 bg-paper hover:bg-black/5 text-ink border border-black/10 rounded font-semibold text-xs"
                        >
                          Log Visit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Technicians */}
      {activeTab === "technicians" && (
        <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-2" />
              <span className="text-xs text-steel">Loading technician fleet...</span>
            </div>
          ) : filteredTechs.length === 0 ? (
            <div className="p-12 text-center text-xs text-steel">No technicians found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Employee ID</th>
                    <th className="p-3.5">Technician Name</th>
                    <th className="p-3.5">Mobile & Area</th>
                    <th className="p-3.5">Licence / PESO</th>
                    <th className="p-3.5">Active Jobs</th>
                    <th className="p-3.5">Completed</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredTechs.map((tech) => (
                    <tr key={tech._id} className="hover:bg-paper/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-ink">{tech.employeeId}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-ink">{tech.name}</div>
                        <span className="text-[11px] text-steel">{tech.skills.slice(0, 2).join(", ")}</span>
                      </td>
                      <td className="p-3.5 text-steel">
                        <div>{tech.phone}</div>
                        <span className="text-[10px] text-steel/70">{tech.serviceArea}</span>
                      </td>
                      <td className="p-3.5 font-mono text-steel">{tech.licenseNumber || "MFS-TECH"}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-brand text-sm">{tech.activeJobsCount}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-green-700">{tech.completedJobsCount}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tech.status === "active"
                              ? "bg-green-100 text-green-800"
                              : tech.status === "busy"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tech.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Automated Cron Engine */}
      {activeTab === "cron" && (
        <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Automated Task Runner</span>
            <h3 className="text-lg font-display font-bold text-ink mt-0.5">Equipment & AMC Reminder Engine</h3>
            <p className="text-xs text-steel mt-1 max-w-2xl leading-relaxed">
              The automated cron engine executes on schedule (configured by <code className="bg-paper px-1 rounded">REFILL_REMINDER_CRON</code>)
              to evaluate upcoming and overdue refill dates (30d, 15d, 7d, 1d, 0d) and AMC renewals.
              Duplicate notifications are prevented via compound database deduplication indexes.
            </p>
          </div>

          <div className="p-4 bg-paper rounded-xl border border-black/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-ink text-sm">Execute Immediate On-Demand Scan</h4>
              <p className="text-xs text-steel mt-0.5">
                Forces a full scan of all customer equipment and AMC contracts right now.
              </p>
            </div>
            <button
              onClick={handleRunCron}
              disabled={cronRunning}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              {cronRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              {cronRunning ? "Scanning Asset Registry..." : "Run Reminder Scan Now"}
            </button>
          </div>

          {cronResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Reminder Scan Completed Successfully
              </div>
              <p>
                Evaluated <strong>{cronResult.inspectedEquipmentCount}</strong> active equipment units across customer
                databases.
              </p>
              <p>
                Dispatched <strong>{cronResult.remindersDispatched}</strong> deduplicated compliance alerts (in-app
                notifications + logged mock SMS/Email).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dispatch Modal */}
      {isDispatchModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display font-bold text-base text-ink">
                Technician Dispatch: {selectedBooking.bookingId}
              </h3>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-steel hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Assign Certified Technician</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded focus:border-brand outline-none"
                >
                  <option value="">-- Select Technician --</option>
                  {technicians.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.employeeId}) · {t.serviceArea}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Booking Status</label>
                <select
                  value={dispatchStatus}
                  onChange={(e) => setDispatchStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded focus:border-brand outline-none"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Technician On The Way">Technician On The Way</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded font-semibold text-ink hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded font-semibold shadow-xs"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Job Card Modal */}
      {isJobCardModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">Field Verification</span>
                <h3 className="font-display font-bold text-base text-ink">
                  Complete & Sign Job Card: {selectedBooking.bookingId}
                </h3>
              </div>
              <button onClick={() => setIsJobCardModalOpen(false)} className="text-steel hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSignJobCard} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Scope of Work Summary</label>
                <textarea
                  rows={2}
                  required
                  value={jobCardSummary}
                  onChange={(e) => setJobCardSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Technician Inspection Remarks</label>
                <textarea
                  rows={2}
                  value={jobCardRemarks}
                  onChange={(e) => setJobCardRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded focus:border-brand outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Form B Reference Number</label>
                  <input
                    type="text"
                    value={jobCardFormB}
                    onChange={(e) => setJobCardFormB(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded focus:border-brand outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Pressure Vessel Test</label>
                  <select
                    value={jobCardPressureTest ? "pass" : "fail"}
                    onChange={(e) => setJobCardPressureTest(e.target.value === "pass")}
                    className="w-full px-3 py-2 border border-black/15 rounded focus:border-brand outline-none"
                  >
                    <option value="pass">Passed / Compliant</option>
                    <option value="fail">Failed / Condemned</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsJobCardModalOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded font-semibold text-ink hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow-xs"
                >
                  Sign & Finalize Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New AMC Modal */}
      {isNewAMCModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display font-bold text-base text-ink">New Annual Maintenance Contract</h3>
              <button onClick={() => setIsNewAMCModalOpen(false)} className="text-steel hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAMC} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Client / Society Name *</label>
                  <input
                    type="text"
                    required
                    value={newAMCClient}
                    onChange={(e) => setNewAMCClient(e.target.value)}
                    placeholder="e.g. Seawoods CHS Ltd"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Company / Entity</label>
                  <input
                    type="text"
                    value={newAMCCompany}
                    onChange={(e) => setNewAMCCompany(e.target.value)}
                    placeholder="Optional company name"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAMCPhone}
                    onChange={(e) => setNewAMCPhone(e.target.value)}
                    placeholder="9820123456"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newAMCEmail}
                    onChange={(e) => setNewAMCEmail(e.target.value)}
                    placeholder="office@example.com"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Premises Type</label>
                  <select
                    value={newAMCPremises}
                    onChange={(e) => setNewAMCPremises(e.target.value)}
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  >
                    <option value="Commercial / Warehousing">Commercial / Warehousing</option>
                    <option value="Residential High-Rise">Residential High-Rise</option>
                    <option value="Industrial / Manufacturing">Industrial / Manufacturing</option>
                    <option value="Healthcare / Hospital">Healthcare / Hospital</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Inspection Frequency</label>
                  <select
                    value={newAMCFrequency}
                    onChange={(e) => setNewAMCFrequency(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  >
                    <option value="Quarterly">Quarterly (4 Visits / Year)</option>
                    <option value="Half-Yearly">Half-Yearly (2 Visits / Year)</option>
                    <option value="Annual">Annual (1 Visit / Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Location / Address *</label>
                <input
                  type="text"
                  required
                  value={newAMCLocation}
                  onChange={(e) => setNewAMCLocation(e.target.value)}
                  placeholder="e.g. Sector 19A, Nerul, Navi Mumbai"
                  className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={newAMCPlan}
                    onChange={(e) => setNewAMCPlan(e.target.value)}
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Annual Contract Value (₹)</label>
                  <input
                    type="number"
                    value={newAMCValue}
                    onChange={(e) => setNewAMCValue(e.target.value)}
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsNewAMCModalOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded font-semibold text-ink hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded font-semibold shadow-xs"
                >
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Tech Modal */}
      {isNewTechModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display font-bold text-base text-ink">Register Certified Technician</h3>
              <button onClick={() => setIsNewTechModalOpen(false)} className="text-steel hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Technician Name *</label>
                <input
                  type="text"
                  required
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  placeholder="e.g. Ramesh Shinde"
                  className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newTechEmployeeId}
                    onChange={(e) => setNewTechEmployeeId(e.target.value)}
                    placeholder="e.g. TECH-004"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newTechPhone}
                    onChange={(e) => setNewTechPhone(e.target.value)}
                    placeholder="9820000000"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Service Area</label>
                  <input
                    type="text"
                    value={newTechArea}
                    onChange={(e) => setNewTechArea(e.target.value)}
                    placeholder="Navi Mumbai"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">License / Reg Number</label>
                  <input
                    type="text"
                    value={newTechLicense}
                    onChange={(e) => setNewTechLicense(e.target.value)}
                    placeholder="MFS-TECH-0499"
                    className="w-full px-3 py-1.5 border border-black/15 rounded focus:border-brand outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsNewTechModalOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded font-semibold text-ink hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded font-semibold shadow-xs"
                >
                  Save Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
