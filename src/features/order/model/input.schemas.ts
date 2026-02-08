import { z } from "zod";

export const createOrderSchema = z.object({
  deliveryDate: z.date(),
  comment: z
    .string()
    .max(500, "Коментар не може перевищувати 500 символів")
    .optional(),
});

export const deleteOrderSchema = z.object({
  id: z.uuid("Неправильний формат ID замовлення"),
});

export const updateOrderSchema = z.object({
  id: z.uuid("Неправильний формат ID замовлення"),
  deliveryDate: z.coerce.date().optional(),
  comment: z
    .string()
    .max(500, "Коментар не може перевищувати 500 символів")
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  id: z.uuid("Неправильний формат ID замовлення"),
  status: z.enum(
    ["published", "accepted", "in_progress", "completed", "cancelled"],
    "Статус повинен бути одним з 'published', 'accepted', 'in_progress', 'completed', або 'cancelled' при оновленні замовлення",
  ),
});

export const updatePaymentStatusSchema = z.object({
  id: z.uuid("Неправильний формат ID замовлення"),
  status: z.enum(
    ["paid", "verified"],
    "Статус повинен бути одним з 'paid', 'verified' при оновленні замовлення",
  ),
});
