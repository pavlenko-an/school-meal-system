import { z } from "zod";

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(255, "Description cannot exceed 255 characters")
    .optional(),
});
