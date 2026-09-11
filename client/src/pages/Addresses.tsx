import { useState } from "react";
import Seo from "@/components/Seo";
import AccountNav from "@/components/AccountNav";
import { MapPin, Plus, Trash2, Home, Building2, Check, X } from "lucide-react";

export default function Addresses() {
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      label: "Main Corporate Office",
      isDefault: true,
      line1: "Plot No. 42, Sector 19, Vashi",
      line2: "Opposite APMC Grain Market",
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
  const [label, setLabel] = useState("Office");
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
        title="Saved Addresses — AK Fire Safety Service"
        description="Manage your facility delivery and billing addresses."
      />

      <div className="bg-paper border-b border-black/10 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Account Settings</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-0.5">
              Saved Facility Addresses
            </h1>
            <p className="text-xs sm:text-sm text-steel mt-0.5">
              Manage locations for equipment deliveries, refill pick-up, and on-site technician inspections.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />

          <div className="flex-1 min-w-0 w-full">
            <div className="grid sm:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm space-y-3 relative ${
                    addr.isDefault ? "border-brand ring-1 ring-brand/20" : "border-black/10"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <span className="font-bold text-sm text-ink flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand" /> {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-brand text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-steel leading-relaxed space-y-0.5">
                    <p className="text-ink font-medium">{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>
                      {addr.city}, {addr.state} - <strong className="text-ink font-mono">{addr.pincode}</strong>
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-black/5 text-xs">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-brand font-semibold hover:underline"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-green-700 font-semibold flex items-center gap-1 text-[11px]">
                        <Check className="w-3.5 h-3.5" /> Active for Deliveries
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-steel hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-black/10 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-4">
              <h3 className="font-bold text-base text-ink">Add New Facility Address</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-steel hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Address Label *</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Office, Factory, Warehouse, Society"
                  className="w-full px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Building / Street *</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Flat/Unit, Building, Plot No."
                  className="w-full px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Area / Landmark</label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Sector, Landmark"
                  className="w-full px-3 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400703"
                    className="w-full px-2.5 py-1.5 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-black/10 rounded text-xs font-semibold hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand text-white rounded text-xs font-semibold hover:bg-brand-dark"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
