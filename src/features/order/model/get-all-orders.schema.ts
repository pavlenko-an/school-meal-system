import { z } from "zod";

export const getAllOrdersSchema = z.object({
  schoolId: z.uuid("Invalid school ID").optional(),
  supplierId: z.uuid("Invalid supplier ID").optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  orderStatus: z
    .enum(
      ["new", "published", "accepted", "in_progress", "completed", "cancelled"],
      "Invalid order status",
    )
    .optional(),
  paymentStatus: z
    .enum(["unpaid", "paid", "verified"], "Invalid payment status")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
