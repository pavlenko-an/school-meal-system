import { z } from "zod";

export const deleteOrderItemSchema = z.object({
  id: z.uuid("Invalid order item ID"),
});
