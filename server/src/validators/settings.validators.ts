import { z } from "zod";

export const updateSettingsSchema = z.object({
  key: z.string().min(2, "Setting key is required"),
  data: z.record(z.any()),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
