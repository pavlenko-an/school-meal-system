import { z } from "zod";

export const getAllOrganizationsSchema = z.object({
  name: z.string().trim().optional(),
  type: z
    .enum(["school", "supplier"], "Type must be either 'school' or 'supplier'")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
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
    .transform((v) => v.trim().toLowerCase()),
  contactPhone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),
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
    .pipe(
      z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number cannot exceed 15 digits")
        .nullable()
        .optional(),
    ),
});

export const deleteOrganizationSchema = z.object({
  id: z.uuid("Invalid organization ID"),
});
