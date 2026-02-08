import { z } from "zod";

export const getAllOrdersSchema = z.object({
  schoolId: z.uuid("Неправильний формат ID школи").optional(),
  supplierId: z.uuid("Неправильний формат ID постачальника").optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  orderStatus: z
    .enum(
      ["new", "published", "accepted", "in_progress", "completed", "cancelled"],
      "Неправильний формат статусу замовлення",
    )
    .optional(),
  paymentStatus: z
    .enum(["unpaid", "paid", "verified"], "Неправильний формат статусу оплати")
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
        z.enum([
          "new",
          "published",
          "accepted",
          "in_progress",
          "completed",
          "cancelled",
        ]),
      ),
      z.enum([
        "all",
        "new",
        "published",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ]),
    ])
    .optional()
    .default("all"),
  paymentStatus: z
    .enum(
      ["all", "unpaid", "paid", "verified"],
      "Неправильний формат статусу оплати",
    )
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
  id: z.uuid("Неправильний формат ID замовлення"),
});

export const getOrderHistorySchema = z.object({
  id: z.uuid("Неправильний формат ID замовлення"),
});
