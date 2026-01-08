import { z } from "zod";

export const updateMenuItemSchema = z.object({
  id: z.string().uuid(),
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
  categoryId: z.string().uuid().optional(),
  isAvailable: z.boolean().optional(),
});
