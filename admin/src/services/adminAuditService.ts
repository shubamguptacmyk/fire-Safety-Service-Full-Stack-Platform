import { apiClient } from "./apiClient";

export interface AdminAuditLogItem {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  module: string;
  entity: string;
  entityId?: string;
  previousValue?: any;
  newValue?: any;
  ip?: string;
  createdAt: string;
}

export const adminAuditService = {
  async getLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    module?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        logs: AdminAuditLogItem[];
        total: number;
        page: number;
        pages: number;
      };
    }>("/audit-logs", { params });
    return res.data.data;
  },

  async getLogById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminAuditLogItem;
    }>(`/audit-logs/${id}`);
    return res.data.data;
  },
};
