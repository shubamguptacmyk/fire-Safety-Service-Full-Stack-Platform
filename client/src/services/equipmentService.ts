import { apiClient } from "./apiClient";

export interface EquipmentItem {
  _id?: string;
  id?: string;
  equipmentId: string;
  name: string;
  serialNumber: string;
  equipmentType: string;
  capacity?: string;
  location: string;
  purchaseDate?: string;
  installationDate: string;
  lastInspectionDate: string;
  lastRefillDate: string;
  nextInspectionDate: string;
  nextRefillDate: string;
  hydroTestDueDate?: string;
  status: "Healthy" | "Inspection Due Soon" | "Refill Due Soon" | "Overdue";
  qrCode?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentStats {
  total: number;
  healthy: number;
  inspectionDueSoon: number;
  refillDueSoon: number;
  overdue: number;
}

export interface EquipmentListResponse {
  items: EquipmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: EquipmentStats;
}

export const equipmentService = {
  async getMyEquipment(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<EquipmentListResponse> {
    const res = await apiClient.get("/equipment/my", { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || 0,
      page: res.data.meta?.page || 1,
      limit: res.data.meta?.limit || 20,
      totalPages: res.data.meta?.totalPages || 1,
      stats: res.data.stats || {
        total: 0,
        healthy: 0,
        inspectionDueSoon: 0,
        refillDueSoon: 0,
        overdue: 0,
      },
    };
  },

  async createEquipment(data: Omit<EquipmentItem, "_id" | "id" | "equipmentId" | "status">): Promise<EquipmentItem> {
    const res = await apiClient.post("/equipment", data);
    return res.data.data;
  },

  async updateEquipment(id: string, data: Partial<EquipmentItem>): Promise<EquipmentItem> {
    const res = await apiClient.put(`/equipment/${id}`, data);
    return res.data.data;
  },

  async deleteEquipment(id: string): Promise<void> {
    await apiClient.delete(`/equipment/${id}`);
  },
};
