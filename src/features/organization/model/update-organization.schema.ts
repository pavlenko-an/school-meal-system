import { z } from "zod";

export const updateOrganizationSchema = z.object({
  id: z.uuid("Invalid organization ID").optional(),
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
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.email("Invalid email address").nullable().optional()),
  contactPhone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().min(10).max(15).nullable().optional()),
});
