import { prisma } from "@/shared/db/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";
import {
  getAllOrderItemsInput,
  OrderItemInfo,
} from "../model/order-item.types";
import { getAllOrderItemsSchema } from "../model/get-all-order-items.schema";

export async function getAllOrderItems(
  data: getAllOrderItemsInput,
): Promise<OrderItemInfo[]> {
  const validated = getAllOrderItemsSchema.parse(data);
  const order = await prisma.order.findUnique({
    where: { id: validated.orderId },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: validated.orderId },
    take: validated.limit,
    skip: validated.offset,
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

  return orderItems.map((item) => ({
    ...item,
    price: Number(item.price),
  }));
}
