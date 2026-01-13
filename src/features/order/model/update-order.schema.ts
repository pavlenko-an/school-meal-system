import { z } from "zod";

export const updateOrderSchema = z.object({
  id: z.uuid("Invalid order ID"),
  deliveryDate: z.coerce.date().optional(),
  comment: z
    .string()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});
