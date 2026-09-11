import { apiClient } from "./apiClient";

export interface ApiAMCVisit {
  visitNumber: number;
  scheduledDate: string;
  completedDate?: string;
  technicianName?: string;
  status: "Pending" | "Completed" | "Missed";
  notes?: string;
}

export interface ApiAMCContract {
  _id: string;
  contractNumber: string;
  clientName: string;
  companyName?: string;
  phone: string;
  email: string;
  premisesType: string;
  location: string;
  planName: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  frequency: "Quarterly" | "Half-Yearly" | "Annual";
  visitsPerYear: number;
  visitsCompleted: number;
  visitsScheduled: ApiAMCVisit[];
  formBStatus: "Current" | "Due in 30 Days" | "Overdue" | "Under Review";
  formBCertificateUrl?: string;
  formBNumber?: string;
  equipmentCount: number;
  annualValue: number;
  status: "Active" | "Expired" | "Renewed" | "Cancelled" | "Pending Approval";
  notes?: string;
  createdAt: string;
}

export const amcService = {
  async getMyAMCContracts(): Promise<ApiAMCContract[]> {
    const res = await apiClient.get("/amc/my");
    return res.data.data || [];
  },

  async getAMCById(id: string): Promise<ApiAMCContract> {
    const res = await apiClient.get(`/amc/${id}`);
    return res.data.data;
  },
};
