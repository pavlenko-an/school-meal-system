import { z } from "zod";

export const getAllOrderItemsSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
