import { z } from "zod";

export const getAllCategoriesSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Ім'я не може перевищувати 100 символів")
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const getCategoryByIdSchema = z.object({
  id: z.uuid("Неправильний формат ID категорії"),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Ім'я повинно містити щонайменше 5 символів")
    .max(100, "Ім'я не може перевищувати 100 символів"),
  description: z
    .string()
    .trim()
    .max(500, "Опис не може перевищувати 500 символів")
    .optional(),
});

export const updateCategorySchema = z.object({
  id: z.uuid("Неправильний формат ID категорії"),
  name: z
    .string()
    .trim()
    .min(5, "Ім'я повинно містити щонайменше 5 символів")
    .max(100, "Ім'я не може перевищувати 100 символів")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Опис не може перевищувати 500 символів")
    .optional(),
});

export const deleteCategorySchema = z.object({
  id: z.uuid("Неправильний формат ID категорії"),
});
