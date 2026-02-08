import { z } from "zod";

export const getAllOrganizationsSchema = z.object({
  name: z.string().trim().optional(),
  type: z
    .enum(["school", "supplier"], "Тип повинен бути 'school' або 'supplier'")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getOrganizationByIdSchema = z.object({
  id: z.uuid("Неправильний формат ID організації"),
});

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Назва повинна бути щонайменше 5 символів")
    .max(100, "Назва не може перевищувати 100 символів"),
  type: z.enum(
    ["school", "supplier"],
    "Тип повинен бути 'school' або 'supplier'",
  ),
  contactEmail: z
    .email("Неправильний формат електронної пошти")
    .transform((v) => v.trim().toLowerCase()),
  contactPhone: z
    .string()
    .trim()
    .min(10, "Номер телефону повинен бути щонайменше 10 цифр")
    .max(15, "Номер телефону не може перевищувати 15 цифр"),
});

export const updateOrganizationSchema = z.object({
  id: z.uuid("Неправильний формат ID організації").optional(),
  name: z
    .string()
    .trim()
    .min(5, "Назва повинна бути щонайменше 5 символів")
    .max(100, "Назва не може перевищувати 100 символів")
    .optional(),
  contactEmail: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .pipe(
      z.email("Неправильний формат електронної пошти").nullable().optional(),
    ),
  contactPhone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .pipe(
      z
        .string()
        .min(10, "Номер телефону повинен бути щонайменше 10 цифр")
        .max(15, "Номер телефону не може перевищувати 15 цифр")
        .nullable()
        .optional(),
    ),
});

export const deleteOrganizationSchema = z.object({
  id: z.uuid("Неправильний формат ID організації"),
});
