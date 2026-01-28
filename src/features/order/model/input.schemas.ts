import { z } from "zod";

export const createOrderSchema = z.object({
  deliveryDate: z.date(),
  comment: z
    .string()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});

export const deleteOrderSchema = z.object({
  id: z.uuid("Invalid order ID"),
});

export const updateOrderSchema = z.object({
  id: z.uuid("Invalid order ID"),
  deliveryDate: z.coerce.date().optional(),
  comment: z
    .string()
    .max(500, "Comment must be at most 500 characters")
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  id: z.uuid("Invalid order ID"),
  status: z.enum(
    ["published", "accepted", "in_progress", "completed", "cancelled"],
    "Status must be one of 'published', 'accepted', 'in_progress', 'completed', or 'cancelled' when updating an order",
  ),
});

export const updatePaymentStatusSchema = z.object({
  id: z.uuid("Invalid order ID"),
  status: z.enum(
    ["paid", "verified"],
    "Status must be one of 'paid', 'verified' when updating an order",
  ),
});
