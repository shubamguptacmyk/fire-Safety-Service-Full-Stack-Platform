import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Building,
  Mail,
  Phone,
  Search,
  Filter,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Award,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { adminCrmService, CustomerListItem } from "@/services/adminCrmService";
import Customer360Modal from "@/components/Customer360Modal";

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterTier, setFilterTier] = useState("All");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCrmService.getCustomers({
        search: searchTerm || undefined,
        customerType: filterType !== "All" ? filterType : undefined,
        tier: filterTier !== "All" ? filterTier : undefined,
      });
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Failed to fetch CRM customers", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType, filterTier]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Gold":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Silver":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-orange-100 text-orange-800 border-orange-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Customer Directory & 360 Registry</h1>
          <p className="text-xs text-steel mt-0.5">
            Commercial corporate clients, residential housing societies, verified GSTIN records, lifetime spend, and 360 profile.
          </p>
        </div>
        <button
          onClick={() => fetchCustomers()}
          className="px-3 py-1.5 bg-paper hover:bg-gray-200 border border-black/10 rounded-lg text-xs font-semibold text-ink flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh List
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-black/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, company, email, phone, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper/50 border border-black/10 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-steel" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-black/10 rounded text-ink font-medium focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="All">All Client Types</option>
            <option value="Corporate B2B">Corporate B2B</option>
            <option value="Housing Society">Housing Society</option>
            <option value="Commercial Retail">Commercial Retail</option>
            <option value="Individual">Individual</option>
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-black/10 rounded text-ink font-medium focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="All">All Loyalty Tiers</option>
            <option value="Platinum">Platinum (&gt;= ₹2L)</option>
            <option value="Gold">Gold (&gt;= ₹50k)</option>
            <option value="Silver">Silver (&gt;= ₹10k)</option>
            <option value="Bronze">Bronze (&lt; ₹10k)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
        {loading && customers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-steel gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-xs">Loading customer directory...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-steel text-xs">
            No customers found matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper/70 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Client / Contact</th>
                  <th className="p-3.5">Company & Entity</th>
                  <th className="p-3.5">Tier</th>
                  <th className="p-3.5">GSTIN</th>
                  <th className="p-3.5">Order Count</th>
                  <th className="p-3.5">Lifetime Spend</th>
                  <th className="p-3.5">Member Since</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {customers.map((client) => (
                  <tr key={client.id} className="hover:bg-paper/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-ink">{client.name}</div>
                      <span className="text-[11px] text-steel block">{client.email}</span>
                      <span className="text-[11px] text-steel block">{client.phone}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-ink block">{client.companyName || "—"}</span>
                      <span className="text-[10px] text-steel">{client.customerType || "B2B Client"}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadge(
                          client.tier
                        )}`}
                      >
                        {client.tier}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {client.gstNumber ? (
                        <span className="font-mono text-brand font-bold bg-brand/5 px-2 py-0.5 rounded text-[10px]">
                          {client.gstNumber}
                        </span>
                      ) : (
                        <span className="text-steel text-[11px]">Unregistered</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-ink font-bold">
                      {client.totalOrders} orders
                    </td>
                    <td className="p-3.5 font-bold font-mono text-ink">
                      ₹{client.lifetimeSpend.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-steel">
                      {new Date(client.registeredAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedCustomerId(client.id)}
                        className="px-2.5 py-1 bg-brand/10 hover:bg-brand hover:text-white border border-brand/20 text-brand rounded font-semibold text-xs transition-colors"
                      >
                        Customer 360
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer 360 Detailed Modal */}
      {selectedCustomerId && (
        <Customer360Modal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
}
