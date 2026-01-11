import { z } from "zod";

export const updateOrderItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity must be at most 100")
    .optional(),
});
