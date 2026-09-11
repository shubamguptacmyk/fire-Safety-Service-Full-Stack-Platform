import { z } from "zod";

export const createServiceBookingSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  companyName: z.string().optional(),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  serviceType: z.enum([
    "Cylinder Refilling",
    "Fire Safety Audit",
    "Fire Audit",
    "Installation",
    "Inspection",
    "Quarterly AMC Inspection",
    "AMC Visit",
    "Maintenance",
    "Emergency Maintenance",
    "Emergency Service",
    "Hydrant Repair",
  ]),
  serviceAddress: z.object({
    street: z.string().min(3, "Street address is required"),
    landmark: z.string().optional(),
    city: z.string().min(2, "City is required").default("Navi Mumbai"),
    state: z.string().min(2, "State is required").default("Maharashtra"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be a 6-digit Indian PIN code"),
  }),
  preferredDate: z.string().min(4, "Preferred date is required"),
  preferredTime: z.string().default("Morning (10:00 AM - 1:00 PM)"),
  equipmentDetails: z.string().optional(),
  problemDescription: z.string().optional(),
});

export const updateServiceStatusSchema = z.object({
  status: z.enum([
    "Requested",
    "Confirmed",
    "Assigned",
    "Technician On The Way",
    "In Progress",
    "Completed",
    "Cancelled",
    "Rejected",
  ]),
  assignedTechnician: z.string().optional(),
  notes: z.string().optional(),
});

export const submitJobCardSchema = z.object({
  jobCardNumber: z.string().optional(),
  summary: z.string().optional(),
  remarks: z.string().optional(),
  pressureTestPassed: z.boolean().optional(),
  formBRef: z.string().optional(),
  partsReplaced: z.array(z.string()).optional(),
  equipmentList: z
    .array(
      z.object({
        equipmentId: z.string().optional(),
        serialNumber: z.string().optional(),
        type: z.string(),
        capacity: z.string().optional(),
        pressureBar: z.number().optional(),
        result: z.enum(["Pass", "Fail", "Repaired", "Condemned"]).default("Pass"),
      })
    )
    .optional(),
  photographs: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().optional(),
        phase: z.enum(["before", "after", "testing"]).default("after"),
      })
    )
    .optional(),
  cost: z
    .object({
      serviceFee: z.number().min(0),
      partsFee: z.number().min(0),
      tax: z.number().min(0),
      total: z.number().min(0),
      paymentStatus: z.enum(["Pending", "Paid", "Covered by AMC"]).default("Pending"),
    })
    .optional(),
});

export const serviceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z
    .enum([
      "Requested",
      "Confirmed",
      "Assigned",
      "Technician On The Way",
      "In Progress",
      "Completed",
      "Cancelled",
    ])
    .optional(),
  serviceType: z.string().optional(),
});

export type CreateServiceBookingInput = z.infer<typeof createServiceBookingSchema>;
export type UpdateServiceStatusInput = z.infer<typeof updateServiceStatusSchema>;
export type SubmitJobCardInput = z.infer<typeof submitJobCardSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
