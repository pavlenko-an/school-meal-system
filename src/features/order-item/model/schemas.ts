import { z } from "zod";

export const getAllOrderItemsSchema = z.object({
  orderId: z.uuid("Неправильний формат ID замовлення"),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const getOrderItemByIdSchema = z.object({
  id: z.uuid("Неправильний формат ID пункту замовлення"),
});

export const createOrderItemSchema = z.object({
  orderId: z.uuid("Неправильний формат ID замовлення"),
  menuItemId: z.uuid("Неправильний формат ID пункту меню"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Кількість повинна бути щонайменше 1")
    .max(100, "Кількість не може перевищувати 100"),
});

export const updateOrderItemSchema = z.object({
  id: z.uuid("Неправильний формат ID пункту замовлення"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Кількість повинна бути щонайменше 1")
    .max(100, "Кількість не може перевищувати 100")
    .optional(),
});

export const deleteOrderItemSchema = z.object({
  id: z.uuid("Неправильний формат ID пункту замовлення"),
});
