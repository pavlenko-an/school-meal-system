import { z } from "zod";

export const createOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity must be at most 100"),
  price: z.number("Price must be a number").positive("Price must be positive"),
});
