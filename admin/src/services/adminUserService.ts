import { apiClient } from "./apiClient";
import { StaffUser, Role, ApiEnvelope } from "@/types";

export interface AdminUsersResponse {
  users: StaffUser[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateAdminPayload {
  name?: string;
  phone?: string;
  role?: Role;
  isActive?: boolean;
  status?: string;
}

export interface ResetPasswordResponse {
  temporaryPassword: string;
  mustChangePassword: boolean;
  message: string;
}

export const adminUserService = {
  async getAdmins(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const res = await apiClient.get<ApiEnvelope<AdminUsersResponse>>("/admin/users", { params });
    return res.data.data;
  },

  async getAdminById(id: string) {
    const res = await apiClient.get<ApiEnvelope<StaffUser>>(`/admin/users/${id}`);
    return res.data.data;
  },

  async createAdmin(payload: CreateAdminPayload) {
    const res = await apiClient.post<ApiEnvelope<StaffUser>>("/admin/users", payload);
    return res.data.data;
  },

  async updateAdmin(id: string, payload: UpdateAdminPayload) {
    const res = await apiClient.patch<ApiEnvelope<StaffUser>>(`/admin/users/${id}`, payload);
    return res.data.data;
  },

  async changePassword(id: string, payload: { password: string; confirmPassword?: string }) {
    const res = await apiClient.post<ApiEnvelope<null>>(`/admin/users/${id}/change-password`, payload);
    return res.data;
  },

  async resetPassword(id: string) {
    const res = await apiClient.post<ApiEnvelope<ResetPasswordResponse>>(`/admin/users/${id}/reset-password`);
    return res.data.data;
  },

  async deleteAdmin(id: string) {
    const res = await apiClient.delete<ApiEnvelope<null>>(`/admin/users/${id}`);
    return res.data;
  },
};
