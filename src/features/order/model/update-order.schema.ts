import { z } from "zod";

export const updateOrderSchema = z.object({
  id: z.uuid("Invalid order ID"),
  deliveryDate: z.coerce.date().optional(),
  status: z
    .enum(
      ["paid", "in_progress", "completed", "cancelled"],
      "Status must be one of 'paid', 'in_progress', 'completed', or 'cancelled' when updating an order"
    )
    .optional(),
  comment: z
    .string()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});
