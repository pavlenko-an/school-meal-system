import { z } from "zod";

export const getAllMenuItemsSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  isAvailable: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
