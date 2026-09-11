import { z } from "zod";

export const createEquipmentSchema = z.object({
  name: z.string().min(2, "Equipment name is required"),
  serialNumber: z.string().min(2, "Serial number is required"),
  equipmentType: z.string().min(2, "Equipment type is required"),
  capacity: z.string().optional(),
  location: z.string().min(2, "Installation location is required"),
  purchaseDate: z.string().optional(),
  installationDate: z.string().min(4, "Installation date is required"),
  lastInspectionDate: z.string().min(4, "Last inspection date is required"),
  lastRefillDate: z.string().min(4, "Last refill date is required"),
  nextInspectionDate: z.string().min(4, "Next inspection date is required"),
  nextRefillDate: z.string().min(4, "Next refill date is required"),
  hydroTestDueDate: z.string().optional(),
  notes: z.string().optional(),
  qrCode: z.string().optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial().extend({
  status: z.enum(["Healthy", "Inspection Due Soon", "Refill Due Soon", "Overdue"]).optional(),
});

export const equipmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["Healthy", "Inspection Due Soon", "Refill Due Soon", "Overdue"]).optional(),
  type: z.string().optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type EquipmentQueryInput = z.infer<typeof equipmentQuerySchema>;
