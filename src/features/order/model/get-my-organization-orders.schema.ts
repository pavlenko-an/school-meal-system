import { z } from "zod";

export const getMyOrganizationOrdersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  orderStatus: z
    .enum(
      [
        "all",
        "new",
        "published",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      "Invalid order status",
    )
    .default("all"),
  paymentStatus: z
    .enum(["all", "unpaid", "paid", "verified"], "Invalid payment status")
    .default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
