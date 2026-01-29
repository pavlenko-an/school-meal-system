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

export const getMyOrganizationOrdersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  orderStatus: z
    .union([
      z.array(
        z.enum(
          ["new", "published", "accepted", "in_progress", "completed", "cancelled"],
        ),
      ),
      z.enum(
        ["all", "new", "published", "accepted", "in_progress", "completed", "cancelled"],
      ),
    ])
    .optional()
    .default("all"),
  paymentStatus: z
    .enum(["all", "unpaid", "paid", "verified"], "Invalid payment status")
    .default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getMyOrganizationStatsSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  statuses: z
    .array(
      z.enum([
        "new",
        "published",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ]),
    )
    .optional()
    .default(["accepted", "in_progress", "completed", "cancelled"]),
});

export const getOrderByIdSchema = z.object({
  id: z.uuid("Invalid order ID"),
});

export const getOrderHistorySchema = z.object({
  id: z.uuid("Invalid order ID"),
});
