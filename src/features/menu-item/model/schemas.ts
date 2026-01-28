import { z } from "zod";

export const getAllMenuItemsSchema = z.object({
  categoryId: z.uuid("Invalid category ID").optional(),
  name: z
    .string()
    .trim()
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  isAvailable: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
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
  price: z.number("Price must be a number").positive("Price must be positive"),
  categoryId: z.uuid("Invalid category ID").optional(),
  isAvailable: z.boolean().optional().default(true),
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
  price: z
    .number("Price must be a number")
    .positive("Price must be positive")
    .optional(),
  categoryId: z.uuid("Invalid category ID").optional(),
  isAvailable: z.boolean().optional(),
});

export const deleteMenuItemSchema = z.object({
  id: z.uuid("Invalid menu item ID"),
});
