import { z } from "zod";

export const createOrderSchema = z.object({
  deliveryDate: z.coerce.date(),
  comment: z
    .string()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});
