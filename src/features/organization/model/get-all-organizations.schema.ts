import { z } from "zod";

export const getAllOrganizationsSchema = z.object({
  type: z
    .enum(["school", "supplier"], "Type must be either 'school' or 'supplier'")
    .optional(),
  contactEmail: z
    .string()
    .email("Invalid email format")
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  contactPhone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
