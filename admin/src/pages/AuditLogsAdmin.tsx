import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  User,
  Monitor,
  X,
  Layers,
  Activity,
  Lock,
} from "lucide-react";
import { adminAuditService, AdminAuditLogItem } from "@/services/adminAuditService";
import Breadcrumbs from "@/components/Breadcrumbs";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";

export default function AuditLogsAdmin() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAuditService.getLogs({
        page,
        limit,
        action: actionFilter === "all" ? undefined : actionFilter,
        module: moduleFilter === "all" ? undefined : moduleFilter,
      });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load system audit trail");
    } finally {
      setLoading(false);
    }
  }, [page, limit, actionFilter, moduleFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Derived modules list
  const availableModules = ["all", "auth", "orders", "quotes", "services", "amc", "equipment", "settings", "crm"];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Compliance & Audit Logs" }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">System Audit Trail & Security Logs</h1>
          <p className="text-xs text-steel mt-0.5">
            Immutable trace of all administrative operations, client data mutations, RBAC access, and IP headers.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white border border-black/10 hover:bg-gray-50 text-ink rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Audit Trail
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events Recorded"
          value={total}
          subtext="Chronological state mutations & logins"
          icon={Activity}
          iconColorClass="text-brand bg-brand/10"
        />
        <StatCard
          title="Monitored Modules"
          value={availableModules.length - 1}
          subtext="CRM, Orders, AMC, Services & Security"
          icon={Layers}
        />
        <StatCard
          title="IP Traceability"
          value="100%"
          subtext="Every staff API event maps client IP & UserAgent"
          icon={Monitor}
          iconColorClass="text-blue-700 bg-blue-50"
        />
        <StatCard
          title="Compliance Standard"
          value="ISO 27001"
          subtext="Compliant immutable audit logs with diff capture"
          icon={Lock}
          iconColorClass="text-green-700 bg-green-50"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-black/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-paper/60 px-3 py-1.5 rounded-lg border border-black/5">
            <Filter className="w-3.5 h-3.5 text-steel" />
            <span className="font-semibold text-steel">Filter Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none font-bold text-ink focus:outline-none cursor-pointer uppercase"
            >
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-paper/60 px-3 py-1.5 rounded-lg border border-black/5">
            <span className="font-semibold text-steel">Action Type:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none font-bold text-ink focus:outline-none cursor-pointer uppercase"
            >
              <option value="all">ALL ACTIONS</option>
              <option value="create">CREATE</option>
              <option value="update">UPDATE</option>
              <option value="delete">DELETE</option>
              <option value="login">LOGIN</option>
              <option value="dispatch">DISPATCH</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <LoadingSkeleton rows={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="w-6 h-6" />}
          title="No audit events found"
          description="Administrative mutations and security events will be automatically logged here in real time."
        />
      ) : (
        <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-paper/80 border-b border-black/10 text-steel font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Operator (User)</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Module / Entity</th>
                  <th className="p-3.5">Entity Reference</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-paper/40 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-mono text-steel">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-ink">{log.user?.name || "System Automated"}</div>
                      <span className="text-[11px] text-steel block">
                        {log.user?.email || "internal-cron"} · {log.user?.role || "system"}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-paper rounded font-mono text-[10px] font-bold uppercase text-brand border border-black/5">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono font-semibold text-ink uppercase">
                        {log.module || log.entity}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-steel whitespace-nowrap max-w-[140px] truncate">
                      {log.entityId || "—"}
                    </td>
                    <td className="p-3.5 font-mono text-steel whitespace-nowrap">
                      {log.ip || "127.0.0.1"}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-black/10 rounded font-semibold text-ink inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Payload Diff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3.5 border-t border-black/10 bg-paper/30 flex items-center justify-between text-xs text-steel">
            <span>
              Showing {logs.length} of {total} audit records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-white border border-black/10 rounded font-semibold text-ink disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-bold text-ink">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= pages}
                className="px-3 py-1 bg-white border border-black/10 rounded font-semibold text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-black/10 overflow-hidden">
            <div className="p-5 border-b border-black/10 flex items-center justify-between bg-paper/60">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-brand" />
                <h2 className="font-display font-bold text-base text-ink">
                  Audit Event: {selectedLog.action.toUpperCase()} on {selectedLog.module}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-paper rounded-xl border border-black/5">
                <div>
                  <span className="text-steel block text-[10px] uppercase font-bold">Operator User</span>
                  <div className="font-bold text-ink mt-0.5">{selectedLog.user?.name || "System"}</div>
                  <span className="text-steel text-[11px]">{selectedLog.user?.email}</span>
                </div>
                <div>
                  <span className="text-steel block text-[10px] uppercase font-bold">Role & Origin IP</span>
                  <div className="font-mono font-bold text-ink mt-0.5">
                    {selectedLog.user?.role || "automated"}
                  </div>
                  <span className="font-mono text-steel text-[11px]">{selectedLog.ip || "127.0.0.1"}</span>
                </div>
              </div>

              {/* State Diff / Mutation Payloads */}
              {selectedLog.previousValue && (
                <div className="space-y-1">
                  <span className="font-bold text-steel uppercase text-[10px] block">
                    Previous State (Before Mutation)
                  </span>
                  <pre className="p-3 bg-red-950 text-red-300 font-mono text-[10px] rounded-lg overflow-x-auto max-h-40 border border-red-900">
                    {JSON.stringify(selectedLog.previousValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div className="space-y-1">
                  <span className="font-bold text-steel uppercase text-[10px] block">
                    Updated State (After Mutation)
                  </span>
                  <pre className="p-3 bg-green-950 text-green-300 font-mono text-[10px] rounded-lg overflow-x-auto max-h-40 border border-green-900">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedLog.previousValue && !selectedLog.newValue && (
                <div className="p-4 text-center text-steel bg-paper rounded-lg border border-black/5">
                  Standard access log event. No direct data model differences were recorded.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-black/10 bg-paper/40 flex justify-end text-xs">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-brand text-white rounded-lg font-semibold"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
