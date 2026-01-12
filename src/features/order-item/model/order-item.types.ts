import { z } from "zod";
import { getAllOrderItemsSchema } from "./get-all-order-items.schema";
import { createOrderItemSchema } from "./create-order-item.schema";
import { updateOrderItemSchema } from "./update-order-item.schema";
import { getOrderItemByIdSchema } from "./get-order-item-by-id.schema";
import { deleteOrderItemSchema } from "./delete-order-item.schema";

export type getAllOrderItemsInput = z.infer<typeof getAllOrderItemsSchema>;
export type getOrderItemByIdInput = z.infer<typeof getOrderItemByIdSchema>;
export type createOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type updateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type deleteOrderItemInput = z.infer<typeof deleteOrderItemSchema>;
