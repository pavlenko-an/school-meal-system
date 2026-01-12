import { z } from "zod";

export const updateMenuItemSchema = z.object({
  id: z.uuid("Invalid menu item ID"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  description: z.string().optional(),
  price: z
    .number("Price must be a number")
    .positive("Price must be positive")
    .optional(),
  categoryId: z.uuid("Invalid category ID").optional(),
  isAvailable: z.boolean().optional(),
});
