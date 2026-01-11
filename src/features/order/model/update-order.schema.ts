import { z } from "zod";

export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  deliveryDate: z.coerce.date(),
  status: z
    .enum(["new", "paid", "in_progress", "completed", "cancelled"])
    .optional(),
  totalPrice: z
    .number("Total price must be a number")
    .positive("Total price must be positive"),
  comment: z
    .string()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});
