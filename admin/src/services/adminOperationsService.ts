import { apiClient } from "./apiClient";

export interface AdminServiceBooking {
  _id: string;
  bookingId: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  serviceType: string;
  serviceAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  preferredDate: string;
  preferredTime: string;
  equipmentDetails?: string;
  problemDescription?: string;
  status:
    | "Requested"
    | "Confirmed"
    | "Assigned"
    | "Technician On The Way"
    | "In Progress"
    | "Completed"
    | "Cancelled";
  assignedTechnician?: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  assignedTechnicianName?: string;
  assignedTechnicianPhone?: string;
  serviceReport?: {
    jobCardNumber?: string;
    summary?: string;
    remarks?: string;
    pressureTestPassed?: boolean;
    formBRef?: string;
    partsReplaced?: string[];
    completedAt?: string;
  };
  createdAt: string;
}

export interface AdminAMCContract {
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
  visitsScheduled: Array<{
    visitNumber: number;
    scheduledDate: string;
    completedDate?: string;
    technicianName?: string;
    status: "Pending" | "Completed" | "Missed";
    notes?: string;
  }>;
  formBStatus: "Current" | "Due in 30 Days" | "Overdue" | "Under Review";
  formBNumber?: string;
  assignedTechnician?: {
    _id: string;
    name: string;
    phone: string;
  };
  equipmentCount: number;
  annualValue: number;
  status: "Active" | "Expired" | "Renewed" | "Cancelled" | "Pending Approval";
  notes?: string;
  createdAt: string;
}

export interface AdminTechnician {
  _id: string;
  name: string;
  phone: string;
  email: string;
  employeeId: string;
  skills: string[];
  serviceArea: string;
  status: "active" | "on-leave" | "busy" | "inactive";
  licenseNumber?: string;
  rating: number;
  activeJobsCount: number;
  completedJobsCount: number;
  notes?: string;
}

export const adminOperationsService = {
  // Service Bookings
  async listBookings(params: { status?: string; serviceType?: string; search?: string; page?: number; limit?: number } = {}) {
    const res = await apiClient.get("/services/all", { params });
    return {
      items: (res.data.data || []) as AdminServiceBooking[],
      total: res.data.meta?.total || 0,
      page: res.data.meta?.page || 1,
      totalPages: res.data.meta?.totalPages || 1,
    };
  },

  async updateBookingStatus(id: string, payload: { status: string; assignedTechnician?: string; notes?: string }) {
    const res = await apiClient.patch(`/services/${id}/status`, payload);
    return res.data.data;
  },

  async submitJobCard(id: string, payload: { summary?: string; remarks?: string; pressureTestPassed?: boolean; formBRef?: string }) {
    const res = await apiClient.post(`/services/${id}/job-card`, payload);
    return res.data.data;
  },

  // AMC Contracts
  async listAMCContracts(params: { status?: string; formBStatus?: string; search?: string; page?: number; limit?: number } = {}) {
    const res = await apiClient.get("/amc/all", { params });
    return {
      items: (res.data.data || []) as AdminAMCContract[],
      total: res.data.meta?.total || 0,
      page: res.data.meta?.page || 1,
      totalPages: res.data.meta?.totalPages || 1,
    };
  },

  async createAMCContract(payload: any) {
    const res = await apiClient.post("/amc", payload);
    return res.data.data;
  },

  async updateAMCContract(id: string, payload: any) {
    const res = await apiClient.put(`/amc/${id}`, payload);
    return res.data.data;
  },

  async recordAMCVisit(id: string, payload: { visitNumber: number; status: string; completedDate?: string; notes?: string }) {
    const res = await apiClient.post(`/amc/${id}/visits`, payload);
    return res.data.data;
  },

  // Technicians
  async listTechnicians(params: { status?: string; area?: string; search?: string } = {}) {
    const res = await apiClient.get("/technicians", { params });
    return (res.data.data || []) as AdminTechnician[];
  },

  async createTechnician(payload: Partial<AdminTechnician>) {
    const res = await apiClient.post("/technicians", payload);
    return res.data.data;
  },

  async updateTechnician(id: string, payload: Partial<AdminTechnician>) {
    const res = await apiClient.put(`/technicians/${id}`, payload);
    return res.data.data;
  },

  // Cron Reminder Trigger
  async triggerReminderScan() {
    const res = await apiClient.post("/notifications/trigger-scan");
    return res.data.data;
  },
};
