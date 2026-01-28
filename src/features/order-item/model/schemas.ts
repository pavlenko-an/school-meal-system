import { z } from "zod";

export const getAllOrderItemsSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const getOrderItemByIdSchema = z.object({
  id: z.uuid("Invalid order item ID"),
});

export const createOrderItemSchema = z.object({
  orderId: z.uuid("Invalid order ID"),
  menuItemId: z.uuid("Invalid menu item ID"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity must be at most 100"),
});

export const updateOrderItemSchema = z.object({
  id: z.uuid("Invalid order item ID"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity must be at most 100")
    .optional(),
});

export const deleteOrderItemSchema = z.object({
  id: z.uuid("Invalid order item ID"),
});
