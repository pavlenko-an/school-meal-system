import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(5).max(100),
  type: z.enum(["school", "supplier"]),
  contactEmail: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  contactPhone: z.string().trim().min(10).max(15).optional(),
});
