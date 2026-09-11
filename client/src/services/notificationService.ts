import { apiClient } from "./apiClient";

export interface ApiNotification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "quote" | "service" | "equipment" | "amc" | "general";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(params: { unread?: boolean; page?: number; limit?: number } = {}) {
    const res = await apiClient.get("/notifications", { params });
    return {
      items: (res.data.data || []) as ApiNotification[],
      total: res.data.meta?.total || 0,
      unreadCount: res.data.meta?.unreadCount || 0,
    };
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/notifications/read-all");
  },
};
