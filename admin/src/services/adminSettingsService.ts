import { apiClient } from "./apiClient";

export interface CompanySettings {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  supportEmail: string;
  address: string;
  gstin: string;
  pan: string;
  licenseNo: string;
  category: string;
  workingHours: string;
  emergencyHelpline: string;
}

export interface TaxSettings {
  defaultGSTRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  flatShippingFee: number;
}

export interface InvoicingSettings {
  invoicePrefix: string;
  quotePrefix: string;
  bookingPrefix: string;
  jobCardPrefix: string;
}

export interface AMCSettings {
  minimumContractDurationMonths: number;
  defaultVisitsPerYear: number;
  formBAutoGenerate: boolean;
  reminderDays: number[];
  statutoryAct: string;
}

export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
}

export interface EmailSettings {
  senderName: string;
  fromAddress: string;
  supportEmail: string;
}

export interface AllSettingsResponse {
  company: CompanySettings;
  tax: TaxSettings;
  shipping: ShippingSettings;
  invoicing: InvoicingSettings;
  amc: AMCSettings;
  notifications: NotificationSettings;
  email: EmailSettings;
  [key: string]: any;
}

export const adminSettingsService = {
  async getAllSettings() {
    const res = await apiClient.get<{
      success: boolean;
      data: AllSettingsResponse;
    }>("/settings");
    return res.data.data;
  },

  async getSettingByKey<T = any>(key: string) {
    const res = await apiClient.get<{
      success: boolean;
      data: T;
    }>(`/settings/${key}`);
    return res.data.data;
  },

  async updateSetting<T = any>(key: string, data: T) {
    const res = await apiClient.put<{
      success: boolean;
      data: T;
    }>(`/settings/${key}`, { data });
    return res.data.data;
  },
};
