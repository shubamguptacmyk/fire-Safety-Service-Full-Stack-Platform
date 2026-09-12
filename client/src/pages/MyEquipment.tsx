import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
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
  Layers,
  Sparkles,
} from "lucide-react";
import { equipmentService, EquipmentItem, EquipmentStats } from "@/services/equipmentService";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  {
    _id: "demo-1",
    equipmentId: "SFP-EQ-4912",
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
    equipmentId: "SFP-EQ-1049",
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
    equipmentId: "SFP-EQ-8819",
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
      try {
        const saved = JSON.parse(
          localStorage.getItem("shubam_registered_equipment") ||
            localStorage.getItem("ak_registered_equipment") ||
            "[]"
        );
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
        setEquipmentList(DEFAULT_EQUIPMENT);
        computeLocalStats(DEFAULT_EQUIPMENT);
      } else {
        setEquipmentList(res.items);
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error("Failed to fetch equipment:", err);
      setError("Unable to sync live inventory from server. Showing local records.");
      const saved = JSON.parse(
        localStorage.getItem("shubam_registered_equipment") ||
          localStorage.getItem("ak_registered_equipment") ||
          "[]"
      );
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
      const newId = `SFP-EQ-${Date.now().toString().slice(-4)}`;
      const newItem: EquipmentItem = {
        equipmentId: newId,
        ...payload,
        status: "Healthy",
      };
      const updated = [newItem, ...equipmentList];
      setEquipmentList(updated);
      localStorage.setItem("shubam_registered_equipment", JSON.stringify(updated));
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
    localStorage.setItem("shubam_registered_equipment", JSON.stringify(updated));
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
        title="My Fire Safety Equipment & Asset Tracker — Shubam Fire Protection"
        description="Register and track due dates for fire extinguishers, cylinders, and hydrant systems with automated inspection and hydro-test reminders."
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Account Portal", href: "/profile" },
              { label: "My Equipment Registry" },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400 font-mono">
                Asset Health & Inspection Tracker
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                Facility Fire Equipment Registry
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Monitor cylinder hydrostatic testing dates, chemical refill cycles, and statutory Form B readiness.
              </p>
            </div>

            <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Register New Equipment
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Equipment
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-slate-900 font-display block mt-2">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Registered in premises</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Healthy & Valid
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-emerald-600 font-display block mt-2">
              {stats.healthy}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Pressure & hydro test valid</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Service Due Soon
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-amber-600 font-display block mt-2">
              {stats.refillDueSoon + stats.inspectionDueSoon}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Inspection/Refill in 30 days</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                Overdue / Expired
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-primary-600 font-display block mt-2">
              {stats.overdue}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Requires urgent service</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {["All", "Healthy", "Due Soon", "Overdue"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === filter
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Equipment Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading equipment inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No equipment found in this filter"
            description="Add your extinguishers, wet risers, and detection panels to monitor maintenance schedules."
            actionText="Register Equipment"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isOverdue = item.status === "Overdue";
              const isDueSoon = item.status.includes("Due Soon");

              return (
                <div
                  key={item._id || item.equipmentId}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
                    isOverdue
                      ? "border-primary-300 ring-1 ring-primary-100"
                      : isDueSoon
                      ? "border-amber-300 ring-1 ring-amber-100"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-slate-400 block">
                          {item.equipmentId}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 leading-snug mt-0.5">
                          {item.name}
                        </h3>
                      </div>
                      <Badge
                        tone={
                          item.status === "Healthy"
                            ? "success"
                            : isDueSoon
                            ? "warning"
                            : "primary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Type & Capacity
                        </span>
                        <span className="font-semibold text-slate-800">
                          {item.capacity} • {item.equipmentType}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Serial Number
                        </span>
                        <span className="font-mono text-slate-700 text-xs truncate block">
                          {item.serialNumber}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Next Inspection:</span>
                        <strong
                          className={
                            new Date(item.nextInspectionDate) < new Date()
                              ? "text-primary-600 font-bold"
                              : "text-slate-800"
                          }
                        >
                          {new Date(item.nextInspectionDate).toLocaleDateString("en-IN")}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Next Hydro-test / Refill:</span>
                        <strong
                          className={
                            new Date(item.nextRefillDate) < new Date()
                              ? "text-primary-600 font-bold"
                              : "text-slate-800"
                          }
                        >
                          {new Date(item.nextRefillDate).toLocaleDateString("en-IN")}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDetailItem(item)}
                    >
                      Details
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="primary">
                        <Link
                          to={`/book-service?type=${
                            isOverdue || item.status === "Refill Due Soon"
                              ? "Refilling"
                              : "Inspection"
                          }&equipment=${encodeURIComponent(item.name + " (" + item.equipmentId + ")")}`}
                        >
                          Book Service
                        </Link>
                      </Button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Register New Equipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Fire Protection Equipment"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Equipment Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ceasefire 4kg ABC Extinguisher"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Serial Number / Body Stamping *"
              required
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. SN-2024-ABC-1092"
            />
            <Input
              label="Location / Floor / Wing *"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Floor 2, Server Lobby"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Equipment Type"
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              options={[
                { value: "ABC Dry Powder", label: "ABC Dry Powder (IS 15683)" },
                { value: "CO2", label: "Carbon Dioxide CO2 (IS 2878)" },
                { value: "Mechanical Foam (AFFF)", label: "Mechanical Foam AFFF (IS 10204)" },
                { value: "Clean Agent (FE-36)", label: "Clean Agent FE-36" },
                { value: "Water Type", label: "Water Type (IS 940)" },
                { value: "Fire Hydrant Landing Valve", label: "Fire Hydrant Landing Valve" },
                { value: "Hose Reel Drum", label: "Hose Reel Drum" },
                { value: "Smoke Detector Panel", label: "Smoke Detector Panel" },
              ]}
            />
            <Input
              label="Capacity / Rating"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 4kg, 4.5kg, 9L"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Installation Date"
              type="date"
              value={installationDate}
              onChange={(e) => setInstallationDate(e.target.value)}
            />
            <Input
              label="Last Refill / Test Date"
              type="date"
              value={lastRefillDate}
              onChange={(e) => setLastRefillDate(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Next Inspection Due"
              type="date"
              value={nextInspectionDate}
              onChange={(e) => setNextInspectionDate(e.target.value)}
            />
            <Input
              label="Next Refill / Hydro-Test Due"
              type="date"
              value={nextRefillDate}
              onChange={(e) => setNextRefillDate(e.target.value)}
            />
          </div>

          <Textarea
            label="Notes / Service Instructions"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Mounted near electrical distribution board; check pressure gauge..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              Register Equipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {detailItem && (
        <Modal
          isOpen={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          title={`Equipment: ${detailItem.name}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 font-mono text-xs block">Equipment ID</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {detailItem.equipmentId}
                </span>
              </div>
              <Badge
                tone={
                  detailItem.status === "Healthy"
                    ? "success"
                    : detailItem.status.includes("Due Soon")
                    ? "warning"
                    : "primary"
                }
              >
                {detailItem.status}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block">Serial Number</span>
                <strong className="text-slate-900 font-mono">{detailItem.serialNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Location</span>
                <strong className="text-slate-900">{detailItem.location}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Type</span>
                <strong className="text-slate-900">{detailItem.equipmentType}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Capacity</span>
                <strong className="text-slate-900">{detailItem.capacity}</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Installation Date:</span>
                <span className="text-slate-900 font-semibold">{detailItem.installationDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Last Inspection:</span>
                <span className="text-slate-900 font-semibold">{detailItem.lastInspectionDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Last Refill:</span>
                <span className="text-slate-900 font-semibold">{detailItem.lastRefillDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Next Inspection Due:</span>
                <span className="text-primary-700 font-bold">{detailItem.nextInspectionDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Next Hydro-test / Refill:</span>
                <span className="text-primary-700 font-bold">{detailItem.nextRefillDate}</span>
              </div>
            </div>

            {detailItem.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <strong className="text-slate-800 block mb-1">Notes:</strong>
                {detailItem.notes}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setDetailItem(null)}>
                Close
              </Button>
              <Button asChild variant="primary">
                <Link
                  to={`/book-service?type=Refilling&equipment=${encodeURIComponent(
                    detailItem.name + " (" + detailItem.equipmentId + ")"
                  )}`}
                >
                  Schedule Service
                </Link>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
