import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  Shield,
  UserPlus,
  Search,
  RefreshCw,
  Edit2,
  KeyRound,
  RotateCcw,
  UserX,
  UserCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2,
  Phone,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { adminUserService, CreateAdminPayload, UpdateAdminPayload } from "@/services/adminUserService";
import { StaffUser, Role } from "@/types";

const ROLE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; bgClass: string; textClass: string; borderClass: string }
> = {
  super_admin: {
    label: "Super Admin",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    bgClass: "bg-purple-100",
    textClass: "text-purple-700",
    borderClass: "border-purple-200",
  },
  admin: {
    label: "Admin",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  sales: {
    label: "Sales Executive",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  technician: {
    label: "Field Technician",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    bgClass: "bg-amber-100",
    textClass: "text-amber-800",
    borderClass: "border-amber-200",
  },
  accountant: {
    label: "Accountant / Billing",
    badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
    bgClass: "bg-cyan-100",
    textClass: "text-cyan-800",
    borderClass: "border-cyan-200",
  },
  customer: {
    label: "Customer",
    badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
    bgClass: "bg-gray-100",
    textClass: "text-gray-700",
    borderClass: "border-gray-200",
  },
};

export default function AdminManagement() {
  const { user: currentUser, can } = useAdminAuthStore();
  const canManage = can("admins.manage") || currentUser?.role === "super_admin";

  // Data state
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState<StaffUser | null>(null);
  const [changePasswordUser, setChangePasswordUser] = useState<StaffUser | null>(null);
  const [resetModalUser, setResetModalUser] = useState<StaffUser | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<{ password: string; userName: string } | null>(null);
  const [toggleStatusUser, setToggleStatusUser] = useState<StaffUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<StaffUser | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateAdminPayload & { confirmPassword: string }>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    isActive: true,
  });
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);

  const [editForm, setEditForm] = useState<UpdateAdminPayload>({
    name: "",
    phone: "",
    role: "admin",
    isActive: true,
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch admin and staff users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminUserService.getAdmins({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setUsers(data.users || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load admin and staff accounts.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: totalCount,
      superAdmins: users.filter((u) => u.role === "super_admin").length,
      admins: users.filter((u) => u.role === "admin").length,
      active: users.filter((u) => u.isActive !== false).length,
    };
  }, [totalCount, users]);

  // Handle Create Admin Submission
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!createForm.name.trim() || createForm.name.trim().length < 2) {
      errs.name = "Full Name must be at least 2 characters";
    }
    if (!createForm.phone.trim() || !/^[6-9]\d{9}$/.test(createForm.phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (!createForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) {
      errs.email = "Enter a valid corporate or official email address";
    }
    if (!createForm.password || createForm.password.length < 8) {
      errs.password = "Password must be at least 8 characters long";
    }
    if (createForm.password !== createForm.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) {
      setCreateFormErrors(errs);
      return;
    }

    setCreateFormErrors({});
    setActionLoading(true);
    try {
      await adminUserService.createAdmin({
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        phone: createForm.phone.trim(),
        password: createForm.password,
        role: createForm.role,
        isActive: createForm.isActive,
      });

      setSuccessMessage(`Administrator "${createForm.name}" created successfully.`);
      setCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "admin",
        isActive: true,
      });
      fetchUsers();
    } catch (err: any) {
      setCreateFormErrors({
        form: err?.response?.data?.message || "Failed to create administrator. Please check your inputs.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  // Handle Edit Admin Submission
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModalUser) return;
    const errs: Record<string, string> = {};

    if (!editForm.name?.trim() || editForm.name.trim().length < 2) {
      errs.name = "Full Name must be at least 2 characters";
    }
    if (editForm.phone && !/^[6-9]\d{9}$/.test(editForm.phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    }

    if (Object.keys(errs).length > 0) {
      setEditFormErrors(errs);
      return;
    }

    setEditFormErrors({});
    setActionLoading(true);
    try {
      await adminUserService.updateAdmin(editModalUser.id, {
        name: editForm.name?.trim(),
        phone: editForm.phone?.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
      });

      setSuccessMessage(`Account for "${editForm.name}" updated successfully.`);
      setEditModalUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditFormErrors({
        form: err?.response?.data?.message || "Failed to update account details.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  // Handle Change Password
  async function handleChangePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!changePasswordUser) return;

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError(null);
    setActionLoading(true);
    try {
      await adminUserService.changePassword(changePasswordUser.id, {
        password: newPassword,
        confirmPassword: confirmNewPassword,
      });

      setSuccessMessage(`Password updated successfully for ${changePasswordUser.name}. All active sessions were revoked.`);
      setChangePasswordUser(null);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setActionLoading(false);
    }
  }

  // Handle Reset Temporary Password
  async function handleResetPassword() {
    if (!resetModalUser) return;
    setActionLoading(true);
    try {
      const res = await adminUserService.resetPassword(resetModalUser.id);
      setTempPasswordResult({
        password: res.temporaryPassword,
        userName: resetModalUser.name,
      });
      setResetModalUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password.");
      setResetModalUser(null);
    } finally {
      setActionLoading(false);
    }
  }

  // Handle Toggle Active / Deactivate
  async function handleToggleStatus() {
    if (!toggleStatusUser) return;
    setActionLoading(true);
    const newStatus = !(toggleStatusUser.isActive !== false);
    try {
      await adminUserService.updateAdmin(toggleStatusUser.id, {
        isActive: newStatus,
      });

      setSuccessMessage(
        `Account for "${toggleStatusUser.name}" has been ${newStatus ? "activated" : "deactivated"}.`
      );
      setToggleStatusUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to change account status.");
      setToggleStatusUser(null);
    } finally {
      setActionLoading(false);
    }
  }

  // Handle Delete Account
  async function handleDeleteUser() {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      await adminUserService.deleteAdmin(deleteUser.id);
      setSuccessMessage(`Account for "${deleteUser.name}" was permanently removed.`);
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete account.");
      setDeleteUser(null);
    } finally {
      setActionLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Header & Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink tracking-tight">Admin & Staff Management</h1>
              <p className="text-xs text-steel mt-0.5">
                Manage administrator credentials, operational staff roles, and system security policies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-steel hover:text-ink bg-white hover:bg-paper border border-black/10 rounded-xl transition shadow-2xs cursor-pointer"
            title="Reload staff directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand" : ""}`} />
            <span>Refresh</span>
          </button>

          {canManage && (
            <button
              onClick={() => {
                setCreateFormErrors({});
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-xl transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Administrator</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-semibold text-steel uppercase tracking-wider block">Total Staff Accounts</span>
          <span className="text-xl font-bold text-ink mt-1 block font-mono">{stats.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-semibold text-steel uppercase tracking-wider block">Super Admins</span>
          <span className="text-xl font-bold text-purple-700 mt-1 block font-mono">{stats.superAdmins}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-semibold text-steel uppercase tracking-wider block">System Admins</span>
          <span className="text-xl font-bold text-blue-700 mt-1 block font-mono">{stats.admins}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-semibold text-steel uppercase tracking-wider block">Active Status</span>
          <span className="text-xl font-bold text-green-700 mt-1 block font-mono">{stats.active}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or phone number..."
            className="w-full pl-9 pr-3.5 py-2 bg-paper/50 hover:bg-paper focus:bg-white border border-black/10 rounded-lg text-xs transition focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-black/10 rounded-lg text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="sales">Sales</option>
            <option value="technician">Technician</option>
            <option value="accountant">Accountant</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-black/10 rounded-lg text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface/80 border-b border-black/10 text-steel font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/10 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-black/10 rounded w-28" />
                          <div className="h-2 bg-black/5 rounded w-36" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-black/10 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-black/10 rounded-full w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-black/10 rounded-full w-16" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-black/10 rounded w-20" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-6 bg-black/10 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Shield className="w-8 h-8 text-steel/40 mx-auto" />
                      <p className="text-sm font-semibold text-ink">No administrators or staff found</p>
                      <p className="text-xs text-steel">
                        No accounts match your current filters. Try changing your search query or role filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((admin) => {
                  const roleConfig = ROLE_CONFIG[admin.role] || ROLE_CONFIG.customer;
                  const isActive = admin.isActive !== false;
                  const isCurrentLoggedUser = currentUser?.id === admin.id;

                  return (
                    <tr key={admin.id} className="hover:bg-paper/40 transition-colors group">
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${roleConfig.bgClass} ${roleConfig.textClass} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                          >
                            {admin.name ? admin.name[0].toUpperCase() : "A"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-ink truncate">{admin.name}</span>
                              {isCurrentLoggedUser && (
                                <span className="px-1.5 py-0.2 bg-brand/10 text-brand text-[9px] font-bold rounded">
                                  You
                                </span>
                              )}
                              {admin.mustChangePassword && (
                                <span
                                  className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded"
                                  title="User must change password on next login"
                                >
                                  Temp Pass
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-steel font-mono block truncate">{admin.email || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-steel text-xs">{admin.phone || "—"}</td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleConfig.badgeClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-steel text-[11px]">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {canManage && (
                            <>
                              {/* Edit Details */}
                              <button
                                onClick={() => {
                                  setEditModalUser(admin);
                                  setEditForm({
                                    name: admin.name,
                                    phone: admin.phone,
                                    role: admin.role,
                                    isActive: admin.isActive !== false,
                                  });
                                  setEditFormErrors({});
                                }}
                                className="p-1.5 text-steel hover:text-ink hover:bg-paper rounded-lg transition-colors"
                                title="Edit staff details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Change Password */}
                              <button
                                onClick={() => {
                                  setChangePasswordUser(admin);
                                  setNewPassword("");
                                  setConfirmNewPassword("");
                                  setPasswordError(null);
                                }}
                                className="p-1.5 text-steel hover:text-ink hover:bg-paper rounded-lg transition-colors"
                                title="Set new password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Reset Temporary Password (staff only, not super_admin) */}
                              {admin.role !== "super_admin" && (
                                <button
                                  onClick={() => setResetModalUser(admin)}
                                  className="p-1.5 text-steel hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Generate temporary password"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Activate / Deactivate Toggle (prevent deactivating super_admin) */}
                              {admin.role !== "super_admin" && (
                                <button
                                  onClick={() => setToggleStatusUser(admin)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isActive
                                      ? "text-steel hover:text-red-700 hover:bg-red-50"
                                      : "text-steel hover:text-green-700 hover:bg-green-50"
                                  }`}
                                  title={isActive ? "Deactivate account" : "Activate account"}
                                >
                                  {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              {/* Delete Account (not allowed on self or super_admin) */}
                              {!isCurrentLoggedUser && admin.role !== "super_admin" && (
                                <button
                                  onClick={() => setDeleteUser(admin)}
                                  className="p-1.5 text-steel hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete administrator"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-surface/50 border-t border-black/10 flex items-center justify-between text-xs text-steel">
          <div>
            Showing <span className="font-semibold text-ink">{users.length}</span> of{" "}
            <span className="font-semibold text-ink">{totalCount}</span> staff accounts
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-black/10 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-black/10 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: CREATE ADMIN */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Create Administrator / Staff</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-steel hover:text-ink p-1 rounded-lg hover:bg-paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createFormErrors.form && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createFormErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Full Name <span className="text-brand">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
                {createFormErrors.name && (
                  <p className="text-[11px] text-brand mt-1 font-medium">{createFormErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">
                    Mobile Number <span className="text-brand">*</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs font-mono border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                  {createFormErrors.phone && (
                    <p className="text-[11px] text-brand mt-1 font-medium">{createFormErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">
                    Official Email <span className="text-brand">*</span>
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="staff@akfiresafety.com"
                    className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                  {createFormErrors.email && (
                    <p className="text-[11px] text-brand mt-1 font-medium">{createFormErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">
                    System Role <span className="text-brand">*</span>
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                    className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                  >
                    {currentUser?.role === "super_admin" && (
                      <option value="super_admin">Super Admin (Full Access)</option>
                    )}
                    <option value="admin">Admin (Operational Management)</option>
                    <option value="sales">Sales (Quotes & Orders)</option>
                    <option value="technician">Technician (Field AMC & Jobs)</option>
                    <option value="accountant">Accountant (Invoices & Reports)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">Status</label>
                  <select
                    value={createForm.isActive ? "active" : "inactive"}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.value === "active" })}
                    className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Password <span className="text-brand">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 pr-9 py-2 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
                  >
                    {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {createFormErrors.password && (
                  <p className="text-[11px] text-brand mt-1 font-medium">{createFormErrors.password}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">
                  Confirm Password <span className="text-brand">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCreateConfirmPassword ? "text" : "password"}
                    value={createForm.confirmPassword}
                    onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-3 pr-9 py-2 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
                  >
                    {showCreateConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {createFormErrors.confirmPassword && (
                  <p className="text-[11px] text-brand mt-1 font-medium">{createFormErrors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-steel hover:bg-paper rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-lg transition shadow-xs disabled:opacity-60"
                >
                  {actionLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ADMIN */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Edit Administrator Details</h3>
              </div>
              <button
                onClick={() => setEditModalUser(null)}
                className="text-steel hover:text-ink p-1 rounded-lg hover:bg-paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editFormErrors.form && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editFormErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
                {editFormErrors.name && (
                  <p className="text-[11px] text-brand mt-1 font-medium">{editFormErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
                {editFormErrors.phone && (
                  <p className="text-[11px] text-brand mt-1 font-medium">{editFormErrors.phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">Role</label>
                  <select
                    value={editForm.role}
                    disabled={editModalUser.role === "super_admin" && currentUser?.role !== "super_admin"}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                    className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                  >
                    {currentUser?.role === "super_admin" && (
                      <option value="super_admin">Super Admin</option>
                    )}
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="technician">Technician</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink block mb-1">Status</label>
                  <select
                    value={editForm.isActive ? "active" : "inactive"}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "active" })}
                    className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-steel hover:bg-paper rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-lg transition shadow-xs disabled:opacity-60"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD */}
      {changePasswordUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-ink">Set New Password</h3>
              </div>
              <button
                onClick={() => setChangePasswordUser(null)}
                className="text-steel hover:text-ink p-1 rounded-lg hover:bg-paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-steel mt-3">
              Set a new permanent password for <strong>{changePasswordUser.name}</strong>. This will revoke all existing sessions.
            </p>

            {passwordError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 pr-9 py-2 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Confirm New Password</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setChangePasswordUser(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-steel hover:bg-paper rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-lg transition shadow-xs disabled:opacity-60"
                >
                  {actionLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RESET PASSWORD CONFIRMATION */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Reset Temporary Password</h3>
                <p className="text-xs text-steel">Generate a secure one-time temporary password.</p>
              </div>
            </div>

            <p className="text-xs text-steel leading-relaxed">
              Are you sure you want to reset the password for <strong>{resetModalUser.name}</strong>? A randomized temporary password will be generated and shown only once. The user will be required to change it on their first login.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setResetModalUser(null)}
                disabled={actionLoading}
                className="px-3.5 py-2 text-xs font-semibold text-steel hover:bg-paper rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-xs disabled:opacity-60"
              >
                {actionLoading ? "Generating..." : "Generate Temporary Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TEMPORARY PASSWORD DISPLAY */}
      {tempPasswordResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Temporary Password Generated</h3>
                <p className="text-xs text-steel">For staff member: {tempPasswordResult.userName}</p>
              </div>
            </div>

            <div className="p-4 bg-paper rounded-xl border border-black/10 my-4 text-center space-y-2">
              <span className="text-[11px] font-semibold text-steel uppercase tracking-wider block">
                Temporary Password (Show Once)
              </span>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-mono font-bold text-ink tracking-wider bg-white px-3 py-1.5 rounded-lg border border-black/10 shadow-2xs">
                  {tempPasswordResult.password}
                </code>
                <button
                  onClick={() => copyToClipboard(tempPasswordResult.password)}
                  className="p-2 rounded-lg bg-white border border-black/10 hover:bg-surface text-steel hover:text-ink transition"
                  title="Copy password to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && <span className="text-[11px] font-medium text-green-700 block">Copied to clipboard!</span>}
            </div>

            <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 leading-relaxed">
              <strong>Important Security Notice:</strong> Please convey this password to the administrator securely. It will not be stored in plaintext and cannot be retrieved again.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setTempPasswordResult(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-dark rounded-lg transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ACTIVATE / DEACTIVATE CONFIRMATION */}
      {toggleStatusUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  toggleStatusUser.isActive !== false
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {toggleStatusUser.isActive !== false ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">
                  {toggleStatusUser.isActive !== false ? "Deactivate Account" : "Activate Account"}
                </h3>
                <p className="text-xs text-steel">Target: {toggleStatusUser.name}</p>
              </div>
            </div>

            <p className="text-xs text-steel leading-relaxed">
              Are you sure you want to {toggleStatusUser.isActive !== false ? "deactivate" : "activate"} the account for{" "}
              <strong>{toggleStatusUser.name}</strong>?
              {toggleStatusUser.isActive !== false &&
                " The user will be logged out and immediately prevented from accessing the admin portal."}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setToggleStatusUser(null)}
                disabled={actionLoading}
                className="px-3.5 py-2 text-xs font-semibold text-steel hover:bg-paper rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition shadow-xs disabled:opacity-60 ${
                  toggleStatusUser.isActive !== false
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : toggleStatusUser.isActive !== false
                  ? "Deactivate Account"
                  : "Activate Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: DELETE ADMIN CONFIRMATION */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Delete Staff Account</h3>
                <p className="text-xs text-steel">Permanent destructive action</p>
              </div>
            </div>

            <p className="text-xs text-steel leading-relaxed">
              Are you sure you want to permanently delete the account for <strong>{deleteUser.name}</strong> (
              {deleteUser.email})? This action cannot be undone.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteUser(null)}
                disabled={actionLoading}
                className="px-3.5 py-2 text-xs font-semibold text-steel hover:bg-paper rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-xs disabled:opacity-60"
              >
                {actionLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
