import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
  price: z.number("Price must be a number").positive("Price must be positive"),
  categoryId: z.uuid("Invalid category ID").optional(),
  isAvailable: z.boolean().optional().default(true),
});
