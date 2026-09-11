import { Setting, ISetting } from "../models/Setting";

const DEFAULT_SETTINGS: Record<string, any> = {
  company: {
    name: "AK Fire Safety & Engineering Solutions",
    tagline: "Licensed Category A Fire Safety Agency",
    phone: "+91 98200 00000",
    email: "contact@akfiresafety.com",
    supportEmail: "support@akfiresafety.com",
    address: "Shop 4, Fire Safety Plaza, MIDC Turbhe, Navi Mumbai, Maharashtra 400705",
    gstin: "27AAAAA0000A1Z5",
    pan: "AAAAA0000A",
    licenseNo: "MFS/LA/CAT-A/2024/0987",
    category: "Category A - Licensed Fire Agency",
    workingHours: "Mon - Sat: 9:00 AM - 7:00 PM",
    emergencyHelpline: "+91 98200 99999",
  },
  tax: {
    defaultGSTRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
  },
  shipping: {
    freeShippingThreshold: 2999,
    flatShippingFee: 150,
  },
  invoicing: {
    invoicePrefix: "INV-2025-",
    quotePrefix: "QT-2025-",
    bookingPrefix: "BK-2025-",
    jobCardPrefix: "JC-2025-",
  },
  amc: {
    minimumContractDurationMonths: 12,
    defaultVisitsPerYear: 4,
    formBAutoGenerate: true,
    reminderDays: [30, 15, 7, 1, 0],
    statutoryAct: "Maharashtra Fire Prevention & Life Safety Measures Act 2006",
  },
  notifications: {
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    whatsappNotificationsEnabled: true,
  },
  email: {
    senderName: "AK Fire Safety",
    fromAddress: "no-reply@akfiresafety.com",
    supportEmail: "support@akfiresafety.com",
  },
};

export class SettingsService {
  static async getByKey<T = any>(key: string): Promise<T> {
    const doc = await Setting.findOne({ key });
    if (doc && doc.data) {
      return doc.data as T;
    }
    return (DEFAULT_SETTINGS[key] || {}) as T;
  }

  static async getAll(): Promise<Record<string, any>> {
    const docs = await Setting.find({});
    const result: Record<string, any> = { ...DEFAULT_SETTINGS };
    for (const doc of docs) {
      result[doc.key] = doc.data;
    }
    return result;
  }

  static async getPublicSettings(): Promise<Record<string, any>> {
    const all = await this.getAll();
    return {
      company: all.company,
      tax: {
        defaultGSTRate: all.tax?.defaultGSTRate ?? 18,
        cgstRate: all.tax?.cgstRate ?? 9,
        sgstRate: all.tax?.sgstRate ?? 9,
        igstRate: all.tax?.igstRate ?? 18,
      },
      shipping: {
        freeShippingThreshold: all.shipping?.freeShippingThreshold ?? 2999,
        flatShippingFee: all.shipping?.flatShippingFee ?? 150,
      },
      amc: {
        defaultVisitsPerYear: all.amc?.defaultVisitsPerYear ?? 4,
        statutoryAct: all.amc?.statutoryAct ?? "Maharashtra Fire Prevention & Life Safety Measures Act 2006",
      },
      notifications: {
        emailNotificationsEnabled: all.notifications?.emailNotificationsEnabled ?? true,
        smsNotificationsEnabled: all.notifications?.smsNotificationsEnabled ?? true,
        whatsappNotificationsEnabled: all.notifications?.whatsappNotificationsEnabled ?? true,
      },
    };
  }

  static async update(key: string, data: Record<string, any>, userId?: string): Promise<ISetting> {
    const setting = await Setting.findOneAndUpdate(
      { key },
      {
        key,
        data,
        updatedBy: userId,
      },
      { upsert: true, new: true, runValidators: true }
    );
    return setting;
  }

  static async updateMultiple(settingsObj: Record<string, any>, userId?: string): Promise<Record<string, any>> {
    const keys = Object.keys(settingsObj);
    for (const key of keys) {
      await this.update(key, settingsObj[key], userId);
    }
    return await this.getAll();
  }
}
