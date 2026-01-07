import { z } from "zod";

export const getAllOrganizationsSchema = z.object({
  type: z.enum(["school", "supplier"]).optional(),
  contactEmail: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  contactPhone: z.string().trim().min(10).max(15).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
