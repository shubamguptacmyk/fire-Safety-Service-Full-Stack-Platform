import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Plus,
  Wrench,
  Calendar,
  MapPin,
  X,
  CheckCircle2,
  Bell,
  Trash2,
  QrCode,
  Loader2,
  FileCheck,
} from "lucide-react";
import { equipmentService, EquipmentItem, EquipmentStats } from "@/services/equipmentService";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  {
    _id: "demo-1",
    equipmentId: "EQ-2023-4912",
    name: "SafePro 4kg ABC Fire Extinguisher",
    serialNumber: "SN-2023-ABC-4912",
    equipmentType: "ABC Dry Powder",
    capacity: "4kg",
    location: "Main Reception & Server Lobby (Floor 1)",
    installationDate: "2023-08-15",
    lastInspectionDate: "2024-02-10",
    lastRefillDate: "2023-08-15",
    nextInspectionDate: "2024-08-10",
    nextRefillDate: "2024-08-15",
    status: "Refill Due Soon",
    notes: "Hydrostatic pressure test required prior to gas recharge.",
  },
  {
    _id: "demo-2",
    equipmentId: "EQ-2024-1049",
    name: "FireShield 4.5kg CO2 Extinguisher",
    serialNumber: "SN-2024-CO2-1049",
    equipmentType: "CO2",
    capacity: "4.5kg",
    location: "Server & UPS Battery Room (Floor 2)",
    installationDate: "2024-01-20",
    lastInspectionDate: "2024-06-15",
    lastRefillDate: "2024-01-20",
    nextInspectionDate: "2025-06-15",
    nextRefillDate: "2026-01-20",
    status: "Healthy",
    notes: "Pressure gauge verified in operating green band.",
  },
  {
    _id: "demo-3",
    equipmentId: "EQ-2022-8819",
    name: "SafePro 9L Foam (AFFF) Extinguisher",
    serialNumber: "SN-2022-AFFF-8819",
    equipmentType: "Mechanical Foam (AFFF)",
    capacity: "9L",
    location: "Basement DG Set & Diesel Tank Area",
    installationDate: "2022-04-10",
    lastInspectionDate: "2023-04-10",
    lastRefillDate: "2022-04-10",
    nextInspectionDate: "2023-10-10",
    nextRefillDate: "2023-04-10",
    status: "Overdue",
    notes: "Immediate refill and inspection required per municipal norms.",
  },
];

export default function MyEquipment() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [stats, setStats] = useState<EquipmentStats>({
    total: 3,
    healthy: 1,
    inspectionDueSoon: 0,
    refillDueSoon: 1,
    overdue: 1,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<EquipmentItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [equipmentType, setEquipmentType] = useState("ABC Dry Powder");
  const [capacity, setCapacity] = useState("4kg");
  const [location, setLocation] = useState("");
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().slice(0, 10));
  const [lastRefillDate, setLastRefillDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextRefillDate, setNextRefillDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
  );
  const [nextInspectionDate, setNextInspectionDate] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!loggedIn) {
      // Offline / guest mode fallback
      try {
        const saved = JSON.parse(localStorage.getItem("ak_registered_equipment") || "[]");
        const list = saved.length > 0 ? saved : DEFAULT_EQUIPMENT;
        setEquipmentList(list);
        computeLocalStats(list);
      } catch {
        setEquipmentList(DEFAULT_EQUIPMENT);
        computeLocalStats(DEFAULT_EQUIPMENT);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await equipmentService.getMyEquipment();
      if (res.items.length === 0) {
        // First-time registered user: show default seed demo or let them create
        setEquipmentList(DEFAULT_EQUIPMENT);
        computeLocalStats(DEFAULT_EQUIPMENT);
      } else {
        setEquipmentList(res.items);
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error("Failed to fetch equipment:", err);
      setError("Unable to sync live inventory from server. Showing local records.");
      const saved = JSON.parse(localStorage.getItem("ak_registered_equipment") || "[]");
      setEquipmentList(saved.length > 0 ? saved : DEFAULT_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  function computeLocalStats(items: EquipmentItem[]) {
    let healthy = 0;
    let inspection = 0;
    let refill = 0;
    let overdue = 0;

    for (const item of items) {
      if (item.status === "Healthy") healthy++;
      else if (item.status === "Inspection Due Soon") inspection++;
      else if (item.status === "Refill Due Soon") refill++;
      else if (item.status === "Overdue") overdue++;
    }

    setStats({
      total: items.length,
      healthy,
      inspectionDueSoon: inspection,
      refillDueSoon: refill,
      overdue,
    });
  }

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  async function handleAddEquipment(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !serialNumber || !location) return;

    setSubmitting(true);
    const payload = {
      name,
      serialNumber,
      equipmentType,
      capacity,
      location,
      installationDate,
      lastInspectionDate: new Date().toISOString().slice(0, 10),
      lastRefillDate,
      nextInspectionDate,
      nextRefillDate,
      notes,
    };

    if (loggedIn) {
      try {
        const created = await equipmentService.createEquipment(payload);
        setEquipmentList((prev) => [created, ...prev]);
        await loadEquipment();
        setIsModalOpen(false);
        resetForm();
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to register equipment on server");
      } finally {
        setSubmitting(false);
      }
    } else {
      // Local storage fallback for unauthenticated previews
      const newId = `EQ-${Date.now().toString().slice(-4)}`;
      const newItem: EquipmentItem = {
        equipmentId: newId,
        ...payload,
        status: "Healthy",
      };
      const updated = [newItem, ...equipmentList];
      setEquipmentList(updated);
      localStorage.setItem("ak_registered_equipment", JSON.stringify(updated));
      computeLocalStats(updated);
      setIsModalOpen(false);
      resetForm();
      setSubmitting(false);
    }
  }

  async function handleDelete(item: EquipmentItem) {
    if (!window.confirm(`Delete ${item.name} (${item.equipmentId})?`)) return;

    const itemId = item._id || item.id;
    if (loggedIn && item._id && !item._id.startsWith("demo-")) {
      try {
        await equipmentService.deleteEquipment(item._id);
      } catch (err) {
        console.error("Failed to delete from server:", err);
      }
    }

    const updated = equipmentList.filter((e) => (e._id || e.id) !== itemId);
    setEquipmentList(updated);
    localStorage.setItem("ak_registered_equipment", JSON.stringify(updated));
    computeLocalStats(updated);
  }

  function resetForm() {
    setName("");
    setSerialNumber("");
    setLocation("");
    setNotes("");
  }

  const filteredItems = equipmentList.filter((item) => {
    if (activeFilter === "Healthy") return item.status === "Healthy";
    if (activeFilter === "Due Soon") return item.status.includes("Due Soon");
    if (activeFilter === "Overdue") return item.status === "Overdue";
    return true;
  });

  return (
    <>
      <Seo
        title="My Fire Safety Equipment & Refill Tracker — AK Fire Safety"
        description="Register and track due dates for fire extinguishers, cylinders, and hydrant systems with automated reminders."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Premises Asset Registry</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-0.5">
              My Equipment & Compliance Tracker
            </h1>
            <p className="text-xs sm:text-sm text-steel mt-0.5">
              Monitor extinguisher pressures, scheduled hydrostatic tests, and automated refill reminder alerts.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Register New Equipment
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Compliance Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveFilter("All")}
            className={`cursor-pointer bg-white border rounded-xl p-4 shadow-sm transition-all ${
              activeFilter === "All" ? "ring-2 ring-brand border-brand" : "border-black/10 hover:border-black/20"
            }`}
          >
            <span className="text-xs text-steel block">Total Registered Units</span>
            <span className="text-2xl font-bold font-display text-ink mt-1 block">{stats.total}</span>
          </div>

          <div
            onClick={() => setActiveFilter("Healthy")}
            className={`cursor-pointer bg-white border rounded-xl p-4 shadow-sm transition-all ${
              activeFilter === "Healthy" ? "ring-2 ring-green-600 border-green-600" : "border-black/10 hover:border-black/20"
            }`}
          >
            <span className="text-xs text-green-700 font-semibold block">Healthy & Certified</span>
            <span className="text-2xl font-bold font-display text-green-700 mt-1 block">{stats.healthy}</span>
          </div>

          <div
            onClick={() => setActiveFilter("Due Soon")}
            className={`cursor-pointer bg-white border rounded-xl p-4 shadow-sm transition-all ${
              activeFilter === "Due Soon" ? "ring-2 ring-amber-600 border-amber-600" : "border-black/10 hover:border-black/20"
            }`}
          >
            <span className="text-xs text-amber-800 font-semibold block">Due Within 30 Days</span>
            <span className="text-2xl font-bold font-display text-amber-800 mt-1 block">
              {stats.refillDueSoon + stats.inspectionDueSoon}
            </span>
          </div>

          <div
            onClick={() => setActiveFilter("Overdue")}
            className={`cursor-pointer bg-white border rounded-xl p-4 shadow-sm transition-all ${
              activeFilter === "Overdue" ? "ring-2 ring-red-600 border-red-600" : "border-black/10 hover:border-black/20"
            }`}
          >
            <span className="text-xs text-red-600 font-semibold block">Overdue / Non-Compliant</span>
            <span className="text-2xl font-bold font-display text-red-600 mt-1 block">{stats.overdue}</span>
          </div>
        </div>

        {/* Upcoming Service Reminders Alert */}
        {(stats.overdue > 0 || stats.refillDueSoon > 0) && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 shrink-0">
                <Bell className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-amber-800">
                  Compliance Action Required
                </span>
                <h3 className="font-bold text-sm text-amber-950 mt-0.5">
                  Upcoming Service Reminders ({stats.overdue + stats.refillDueSoon} unit{stats.overdue + stats.refillDueSoon > 1 ? "s" : ""})
                </h3>
                <p className="text-xs text-amber-900/80 mt-0.5 max-w-xl leading-relaxed">
                  {stats.overdue > 0
                    ? `${stats.overdue} unit(s) are overdue for chemical refilling or hydrostatic pressure proof testing. Non-compliance exposes your facility to municipal fire penalties.`
                    : `${stats.refillDueSoon} unit(s) will reach statutory expiry within the next 30 days.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/book-service?type=Refilling")}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" /> Book Service for Due Units
            </button>
          </div>
        )}

        {/* Equipment Cards List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
            <p className="text-xs text-steel">Scanning equipment compliance records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white border border-black/10 rounded-xl p-8">
            <ShieldCheck className="w-12 h-12 text-steel/40 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-ink">No equipment found matching filter</h3>
            <p className="text-xs text-steel mt-1">Register extinguishers or adjust your filter selection above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isOverdue = item.status === "Overdue";
              const isDueSoon = item.status.includes("Due Soon");

              return (
                <div
                  key={item._id || item.equipmentId}
                  className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                    isOverdue
                      ? "border-red-300 bg-red-50/20"
                      : isDueSoon
                      ? "border-amber-400 bg-amber-50/20"
                      : "border-black/10"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between pb-3 border-b border-black/10 gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-base text-ink">{item.name}</span>
                        <span className="font-mono text-xs text-steel">({item.equipmentId})</span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            isOverdue
                              ? "bg-red-100 text-red-700 animate-pulse"
                              : isDueSoon
                              ? "bg-amber-100 text-amber-900"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-xs text-steel mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand" /> Location: {item.location} · Serial No:{" "}
                        <span className="font-mono">{item.serialNumber}</span>
                        {item.capacity && <span> · Capacity: {item.capacity}</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="px-2.5 py-1.5 rounded text-xs font-semibold bg-paper hover:bg-black/5 text-ink border border-black/10 transition-colors"
                      >
                        Specs & Log
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/book-service?type=${encodeURIComponent(
                              item.status.includes("Refill") ? "Refilling" : "Inspection"
                            )}&equipment=${encodeURIComponent(`${item.name} (${item.equipmentId})`)}`
                          )
                        }
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
                          isOverdue || isDueSoon
                            ? "bg-brand hover:bg-brand-dark text-white"
                            : "bg-paper hover:bg-black/5 text-ink border border-black/10"
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" /> Book Service Visit
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-steel hover:text-red-600 rounded transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-paper p-3 rounded-lg border border-black/5">
                      <span className="text-steel block flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-steel/70" /> Installed On
                      </span>
                      <strong className="text-ink mt-0.5 block">
                        {new Date(item.installationDate).toLocaleDateString("en-IN")}
                      </strong>
                    </div>

                    <div className="bg-paper p-3 rounded-lg border border-black/5">
                      <span className="text-steel block flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-steel/70" /> Last Refilled
                      </span>
                      <strong className="text-ink mt-0.5 block">
                        {new Date(item.lastRefillDate).toLocaleDateString("en-IN")}
                      </strong>
                    </div>

                    <div
                      className={`p-3 rounded-lg border ${
                        isOverdue
                          ? "bg-red-50 border-red-200 text-red-900"
                          : isDueSoon
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-paper border-black/5 text-ink"
                      }`}
                    >
                      <span className="block flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Next Refill Due
                      </span>
                      <strong className="mt-0.5 block">
                        {new Date(item.nextRefillDate).toLocaleDateString("en-IN")}
                      </strong>
                    </div>

                    <div className="bg-paper p-3 rounded-lg border border-black/5">
                      <span className="text-steel block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-steel/70" /> Next Inspection
                      </span>
                      <strong className="text-ink mt-0.5 block">
                        {new Date(item.nextInspectionDate).toLocaleDateString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-xs text-steel bg-paper/60 p-2.5 rounded-lg border border-black/5 flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display font-bold text-lg text-ink">Register Fire Safety Equipment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-steel hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SafePro 4kg ABC Fire Extinguisher"
                  className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-2024-ABC-8412"
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Capacity / Weight</label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 4kg, 4.5kg, 9L"
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Equipment Type</label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                  >
                    <option value="ABC Dry Powder">ABC Dry Powder (IS 15683)</option>
                    <option value="CO2">CO2 Carbon Dioxide (IS 2878)</option>
                    <option value="Mechanical Foam (AFFF)">Mechanical Foam (AFFF)</option>
                    <option value="Water / Wet Chemical">Water / Wet Chemical</option>
                    <option value="Clean Agent">Clean Agent (HFC/FK)</option>
                    <option value="Hose Reel Drum">Hose Reel Drum</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Installation Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Server Room (Floor 2)"
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Installation Date</label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Last Refill Date</label>
                  <input
                    type="date"
                    value={lastRefillDate}
                    onChange={(e) => setLastRefillDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink mb-1">Next Refill Due Date *</label>
                  <input
                    type="date"
                    required
                    value={nextRefillDate}
                    onChange={(e) => setNextRefillDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none font-semibold text-brand"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Next Inspection Date</label>
                  <input
                    type="date"
                    value={nextInspectionDate}
                    onChange={(e) => setNextInspectionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Service & Technical Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Hydro-test stamped 2024, gauge in green zone"
                  className="w-full px-3 py-2 border border-black/15 rounded-md focus:border-brand focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-black/15 text-ink hover:bg-black/5 rounded font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand hover:bg-brand-dark text-white rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Technical Profile & History Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand uppercase">
                  {detailItem.equipmentId}
                </span>
                <h3 className="font-display font-bold text-base text-ink">{detailItem.name}</h3>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-steel hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-paper p-3.5 rounded-xl">
                <div>
                  <span className="text-steel block">Serial Number</span>
                  <strong className="text-ink font-mono mt-0.5 block">{detailItem.serialNumber}</strong>
                </div>
                <div>
                  <span className="text-steel block">Equipment Type</span>
                  <strong className="text-ink mt-0.5 block">{detailItem.equipmentType}</strong>
                </div>
                <div>
                  <span className="text-steel block">Capacity</span>
                  <strong className="text-ink mt-0.5 block">{detailItem.capacity || "Standard"}</strong>
                </div>
                <div>
                  <span className="text-steel block">Location Node</span>
                  <strong className="text-ink mt-0.5 block">{detailItem.location}</strong>
                </div>
              </div>

              <div className="p-3.5 bg-paper rounded-xl space-y-2">
                <h4 className="font-bold text-ink">Statutory Servicing Timeline</h4>
                <div className="space-y-1 text-steel">
                  <p>• Commissioned On: <strong className="text-ink">{new Date(detailItem.installationDate).toLocaleDateString("en-IN")}</strong></p>
                  <p>• Last Chemical Refill: <strong className="text-ink">{new Date(detailItem.lastRefillDate).toLocaleDateString("en-IN")}</strong></p>
                  <p>• Next Refill Due: <strong className="text-brand">{new Date(detailItem.nextRefillDate).toLocaleDateString("en-IN")}</strong></p>
                  <p>• Next Routine Inspection: <strong className="text-ink">{new Date(detailItem.nextInspectionDate).toLocaleDateString("en-IN")}</strong></p>
                </div>
              </div>

              <div className="p-3.5 bg-green-50/70 border border-green-200 rounded-xl space-y-1 text-green-900">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-700" /> Maintenance Relationship
                </span>
                <p className="text-[11px]">
                  Associated with registered premises fire protection schedule. Eligible for Form B biannual statutory sign-off.
                </p>
              </div>

              {detailItem.notes && (
                <div className="p-3 bg-paper rounded-xl border border-black/5 text-steel">
                  <strong className="text-ink block mb-0.5">Inspector Notes:</strong>
                  {detailItem.notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/10">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 border border-black/15 text-ink rounded-lg text-xs font-semibold hover:bg-paper"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const item = detailItem;
                  setDetailItem(null);
                  navigate(
                    `/book-service?type=${encodeURIComponent(
                      item.status.includes("Refill") ? "Refilling" : "Inspection"
                    )}&equipment=${encodeURIComponent(`${item.name} (${item.equipmentId})`)}`
                  );
                }}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Wrench className="w-3.5 h-3.5" /> Book Service for this Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
