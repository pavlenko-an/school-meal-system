import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  id: z.uuid("Invalid order ID"),
  status: z.enum(
    ["published", "accepted", "in_progress", "completed", "cancelled"],
    "Status must be one of 'published', 'accepted', 'in_progress', 'completed', or 'cancelled' when updating an order"
  ),
});
