import { z } from "zod";

export const getAllOrganizationsSchema = z.object({
  name: z.string().trim().optional(),
  type: z
    .enum(["school", "supplier"], "Type must be either 'school' or 'supplier'")
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .optional(),
  offset: z.coerce
    .number()
    .int()
    .min(0, "Offset must be at least 0")
    .optional(),
});

export const getOrganizationByIdSchema = z.object({
  id: z.uuid("Invalid organization ID"),
});

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name must be at most 100 characters"),
  type: z.enum(
    ["school", "supplier"],
    "Type must be either 'school' or 'supplier'",
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

export const updateOrganizationSchema = z.object({
  id: z.uuid("Invalid organization ID").optional(),
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name must be at most 100 characters")
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

export const deleteOrganizationSchema = z.object({
  id: z.uuid("Invalid organization ID"),
});
