import { z } from "zod";

export const createOrderItemSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  menuItemId: z.uuid("Invalid menu item ID"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity must be at most 100"),
});
