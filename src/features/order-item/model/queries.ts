import { prisma } from "@/shared/db/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";
import {
  getAllOrderItemsInput,
  getOrderItemByIdInput,
  OrderItemInfo,
} from "../model/types";
import { getAllOrderItemsSchema, getOrderItemByIdSchema } from "./schemas";

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
