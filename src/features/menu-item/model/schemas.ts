import { z } from "zod";

export const getAllMenuItemsSchema = z.object({
  categoryId: z.uuid("Неправильний формат ID категорії").optional(),
  name: z
    .string()
    .trim()
    .max(100, "Назва не може перевищувати 100 символів")
    .optional(),
  isAvailable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getMenuItemByIdSchema = z.object({
  id: z.uuid("Неправильний формат ID пункту меню"),
});

export const createMenuItemSchema = z.object({
  name: z
    .string()
    .min(5, "Назва повинна містити щонайменше 5 символів")
    .max(100, "Назва не може перевищувати 100 символів"),
  description: z
    .string()
    .trim()
    .max(500, "Опис не може перевищувати 500 символів")
    .optional(),
  price: z.coerce.number().positive("Ціна повинна бути додатньою"),
  categoryId: z.uuid("Неправильний формат ID категорії").optional(),
  isAvailable: z.coerce.boolean().default(true),
  image: z.instanceof(File).optional(),
});

export const updateMenuItemSchema = z.object({
  id: z.uuid("Неправильний формат ID пункту меню"),
  name: z
    .string()
    .min(1, "Назва обов'язкова")
    .max(100, "Назва не може перевищувати 100 символів")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Опис не може перевищувати 500 символів")
    .optional(),
  price: z.coerce.number().positive("Ціна повинна бути додатньою").optional(),
  categoryId: z.uuid("Неправильний формат ID категорії").optional(),
  isAvailable: z.coerce.boolean().default(true),
  image: z.instanceof(File).optional(),
});

export const deleteMenuItemSchema = z.object({
  id: z.uuid("Неправильний формат ID пункту меню"),
});
