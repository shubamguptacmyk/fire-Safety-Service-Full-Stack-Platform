import { z } from "zod";

export const createAMCContractSchema = z.object({
  userId: z.string().optional(),
  clientName: z.string().min(2, "Client name is required"),
  companyName: z.string().optional(),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  premisesType: z.string().min(2, "Premises type is required"),
  location: z.string().min(2, "Location is required"),
  planName: z.string().min(2, "Plan name is required"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().min(4, "End date is required"),
  renewalDate: z.string().min(4, "Renewal date is required"),
  frequency: z.enum(["Quarterly", "Half-Yearly", "Annual"]).default("Quarterly"),
  assignedTechnician: z.string().optional(),
  equipmentCount: z.number().int().min(1).default(1),
  annualValue: z.number().min(0, "Annual value must be non-negative"),
  notes: z.string().optional(),
});

export const updateAMCContractSchema = createAMCContractSchema.partial().extend({
  status: z.enum(["Active", "Expired", "Renewed", "Cancelled", "Pending Approval"]).optional(),
  formBStatus: z.enum(["Current", "Due in 30 Days", "Overdue", "Under Review"]).optional(),
  formBCertificateUrl: z.string().optional(),
  formBNumber: z.string().optional(),
});

export const recordAMCVisitSchema = z.object({
  visitNumber: z.number().int().min(1),
  completedDate: z.string().optional(),
  status: z.enum(["Pending", "Completed", "Missed"]),
  technician: z.string().optional(),
  notes: z.string().optional(),
});

export const amcQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["Active", "Expired", "Renewed", "Cancelled", "Pending Approval"]).optional(),
  formBStatus: z.enum(["Current", "Due in 30 Days", "Overdue", "Under Review"]).optional(),
});

export type CreateAMCContractInput = z.infer<typeof createAMCContractSchema>;
export type UpdateAMCContractInput = z.infer<typeof updateAMCContractSchema>;
export type RecordAMCVisitInput = z.infer<typeof recordAMCVisitSchema>;
export type AMCQueryInput = z.infer<typeof amcQuerySchema>;
