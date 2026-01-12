import { z } from "zod";

export const createOrderSchema = z.object({
  schoolId: z.uuid("Invalid school ID"),
  deliveryDate: z.coerce.date(),
  comment: z
    .string()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});
