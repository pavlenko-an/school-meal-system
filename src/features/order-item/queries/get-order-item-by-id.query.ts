import { prisma } from "@/shared/db/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { getOrderItemByIdSchema } from "../model/get-order-item-by-id.schema";
import {
  getOrderItemByIdInput,
  OrderItemInfo,
} from "../model/order-item.types";

export async function getOrderItemById(
  data: getOrderItemByIdInput,
): Promise<OrderItemInfo> {
  const validated = getOrderItemByIdSchema.parse(data);
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: validated.id },
    select: {
      id: true,
      quantity: true,
      price: true,
      menuItem: {
        select: {
          id: true,
          name: true,
          description: true,
          images: {
            select: {
              id: true,
              imageUrl: true,
              isPrimary: true,
            },
          },
        },
      },
    },
  });
  if (!orderItem) {
    throw new NotFoundError("Order item not found");
  }
  return {
    ...orderItem,
    price: Number(orderItem.price),
  };
}
