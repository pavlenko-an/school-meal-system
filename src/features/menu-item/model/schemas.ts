import { z } from "zod";

export const getAllMenuItemsSchema = z.object({
  categoryId: z.uuid("Invalid category ID").optional(),
  name: z
    .string()
    .trim()
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  isAvailable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getMenuItemByIdSchema = z.object({
  id: z.uuid("Invalid menu item ID"),
});

export const createMenuItemSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().positive("Price must be positive"),
  ),
  categoryId: z.uuid("Invalid category ID").optional(),
  isAvailable: z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    return val;
  }, z.boolean().default(true)),
  image: z.instanceof(File).optional(),
});

export const updateMenuItemSchema = z.object({
  id: z.uuid("Invalid menu item ID"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  price: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().positive("Price must be positive").optional(),
  ),
  categoryId: z.uuid("Invalid category ID").optional(),
  isAvailable: z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    return val;
  }, z.boolean().optional()),
  image: z.instanceof(File).optional(),
});

export const deleteMenuItemSchema = z.object({
  id: z.uuid("Invalid menu item ID"),
});
