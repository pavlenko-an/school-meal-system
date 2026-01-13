import { z } from "zod";

export const updatePaymentStatusSchema = z.object({
  id: z.uuid("Invalid order ID"),
  status: z.enum(
    ["paid", "verified"],
    "Status must be one of 'paid', 'verified' when updating an order"
  ),
});
