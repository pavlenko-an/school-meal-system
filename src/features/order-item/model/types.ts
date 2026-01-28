import { z } from "zod";
import {
  createOrderItemSchema,
  deleteOrderItemSchema,
  getAllOrderItemsSchema,
  getOrderItemByIdSchema,
  updateOrderItemSchema,
} from "./schemas";

export type getAllOrderItemsInput = z.infer<typeof getAllOrderItemsSchema>;
export type getOrderItemByIdInput = z.infer<typeof getOrderItemByIdSchema>;
export type createOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type updateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type deleteOrderItemInput = z.infer<typeof deleteOrderItemSchema>;

export type OrderItemInfo = {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
    description: string | null;
    images:
      | {
          id: string;
          imageUrl: string;
          isPrimary: boolean;
        }[]
      | null;
  } | null;
};
