import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name must be at most 100 characters"),
  type: z.enum(
    ["school", "supplier"],
    "Type must be either 'school' or 'supplier'"
  ),
  contactEmail: z
    .email("Invalid email format")
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  contactPhone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .optional(),
});
