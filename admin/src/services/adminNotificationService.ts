import { apiClient } from "./apiClient";

export interface AdminNotificationItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  message: string;
  type: "refill_reminder" | "amc_renewal" | "service_update" | "order" | "quote" | "system" | "general";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const adminNotificationService = {
  async getNotifications(params?: { page?: number; limit?: number; isRead?: boolean; type?: string }) {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminNotificationItem[];
      meta: {
        total: number;
        unreadCount?: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/admin/notifications", { params });
    return res.data;
  },

  async markRead(id: string) {
    const res = await apiClient.patch<{
      success: boolean;
      data: AdminNotificationItem;
    }>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead() {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
    }>("/notifications/read-all");
    return res.data;
  },

  async deleteNotification(id: string) {
    const res = await apiClient.delete(`/admin/notifications/${id}`);
    return res.data;
  },

  async triggerReminderScan() {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/notifications/trigger-scan");
    return res.data;
  },
};
