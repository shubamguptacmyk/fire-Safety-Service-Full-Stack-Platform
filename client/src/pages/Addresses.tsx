import { useState } from "react";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { MapPin, Plus, Trash2, Home, Building2, Check, X } from "lucide-react";

export default function Addresses() {
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      label: "Main Corporate Office",
      isDefault: true,
      line1: "Plot No. 42, Sector 19, Vashi",
      line2: "Opposite APMC Market",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400703",
    },
    {
      id: "addr-2",
      label: "Taloja Warehouse / Factory",
      isDefault: false,
      line1: "Shed No. B-12, MIDC Industrial Area",
      line2: "Near CETP Plant",
      city: "Taloja, Navi Mumbai",
      state: "Maharashtra",
      pincode: "410208",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [label, setLabel] = useState("Corporate Office");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("Navi Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");

  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!line1 || !pincode) return;
    const newAddr = {
      id: `addr-${Date.now()}`,
      label,
      isDefault: addresses.length === 0,
      line1,
      line2,
      city,
      state,
      pincode,
    };
    setAddresses([...addresses, newAddr]);
    setIsModalOpen(false);
    setLine1("");
    setLine2("");
    setPincode("");
  }

  function handleDelete(id: string) {
    setAddresses(addresses.filter((a) => a.id !== id));
  }

  function handleSetDefault(id: string) {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  return (
    <>
      <Seo
        title="Saved Addresses & Facility Sites — Shubam Fire Protection"
        description="Manage your facility delivery and site inspection addresses across Mumbai MMR."
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Account Portal", href: "/profile" },
              { label: "Facility Addresses" },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400 font-mono">
                Site & Logistics Management
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                Saved Facility Addresses
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Manage locations for equipment deliveries, refill pick-up, and on-site technician inspections.
              </p>
            </div>

            <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add New Address
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {addresses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No facility addresses saved"
            description="Add your office, factory, or society address for faster equipment delivery and service bookings."
            actionText="Add Address"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 relative transition-all ${
                  addr.isDefault
                    ? "border-primary-600 ring-2 ring-primary-100"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-600" />
                    <span className="font-bold text-sm text-slate-900">{addr.label}</span>
                  </div>
                  {addr.isDefault && (
                    <Badge tone="primary">Default Site</Badge>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1">
                  <p className="text-slate-900 font-medium">{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr.city}, {addr.state} -{" "}
                    <strong className="text-slate-900 font-mono">{addr.pincode}</strong>
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-primary-700 font-bold hover:underline"
                    >
                      Set as Default Site
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
                      <Check className="w-4 h-4" /> Active Dispatch Destination
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Facility Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Address Label *"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Office, Factory, Warehouse, Society"
          />

          <Input
            label="Building / Street Address *"
            required
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Flat/Unit, Building, Plot No."
          />

          <Input
            label="Area / Sector / Landmark"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            placeholder="e.g. Sector 19A, Near APMC Market"
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="State"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Input
              label="Pincode *"
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="400703"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
