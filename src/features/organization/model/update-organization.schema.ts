import { z } from "zod";

export const updateOrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  type: z
    .enum(["school", "supplier"], "Type must be either 'school' or 'supplier'")
    .optional(),
  contactEmail: z
    .union([
      z
        .string()
        .email("Invalid email format")
        .transform((v) => v.trim().toLowerCase()),
      z.literal(""),
    ])
    .transform((v) => (v === "" ? null : v))
    .optional(),
  contactPhone: z
    .union([
      z
        .string()
        .trim()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number cannot exceed 15 digits"),
      z.literal(""),
    ])
    .transform((v) => (v === "" ? null : v))
    .optional(),
});
