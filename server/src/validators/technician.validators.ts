import { z } from "zod";

export const createTechnicianSchema = z.object({
  name: z.string().min(2, "Technician name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  employeeId: z.string().min(2, "Employee ID is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  serviceArea: z.string().min(2, "Service area is required"),
  status: z.enum(["active", "on-leave", "busy", "inactive"]).default("active"),
  licenseNumber: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  profilePhoto: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTechnicianSchema = createTechnicianSchema.partial();

export const technicianQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  status: z.enum(["active", "on-leave", "busy", "inactive"]).optional(),
  area: z.string().optional(),
});

export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
export type UpdateTechnicianInput = z.infer<typeof updateTechnicianSchema>;
