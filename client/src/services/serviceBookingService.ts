import { apiClient } from "./apiClient";

export interface CreateBookingPayload {
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  serviceType: string;
  serviceAddress: {
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  preferredDate: string;
  preferredTime: string;
  equipmentDetails?: string;
  problemDescription?: string;
}

export interface ApiServiceBooking {
  _id: string;
  bookingId: string;
  userId?: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  serviceType: string;
  serviceAddress: {
    street: string;
    landmark?: string;
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
  cost?: {
    serviceFee: number;
    partsFee: number;
    tax: number;
    total: number;
    paymentStatus: string;
  };
  createdAt: string;
}

export const serviceBookingService = {
  async createBooking(payload: CreateBookingPayload): Promise<ApiServiceBooking> {
    const res = await apiClient.post("/services", payload);
    return res.data.data;
  },

  async getMyBookings(params: { status?: string; page?: number; limit?: number } = {}) {
    const res = await apiClient.get("/services/my", { params });
    return {
      items: (res.data.data || []) as ApiServiceBooking[],
      total: res.data.meta?.total || 0,
      page: res.data.meta?.page || 1,
      limit: res.data.meta?.limit || 20,
      totalPages: res.data.meta?.totalPages || 1,
    };
  },

  async getBookingById(id: string): Promise<ApiServiceBooking> {
    const res = await apiClient.get(`/services/${id}`);
    return res.data.data;
  },
};
