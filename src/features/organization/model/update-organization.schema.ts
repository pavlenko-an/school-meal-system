import { z } from "zod";

export const updateOrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(5).max(100).optional(),
  type: z.enum(["school", "supplier"]).optional(),
  contactEmail: z
    .union([
      z
        .string()
        .email()
        .transform((v) => v.trim().toLowerCase()),
      z.literal(""),
    ])
    .transform((v) => (v === "" ? null : v))
    .optional(),
  contactPhone: z
    .union([z.string().trim().min(10).max(15), z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .optional(),
});
