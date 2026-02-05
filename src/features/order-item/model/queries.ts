import { prisma } from "@/shared/db/prisma";
import {
  getAllOrderItemsInput,
  getOrderItemByIdInput,
  OrderItemInfo,
} from "../model/types";
import { getAllOrderItemsSchema, getOrderItemByIdSchema } from "./schemas";
import { notFound } from "next/navigation";

export async function getAllOrderItems(
  data: getAllOrderItemsInput,
): Promise<OrderItemInfo[]> {
  const validated = getAllOrderItemsSchema.parse(data);
  const order = await prisma.order.findUnique({
    where: { id: validated.orderId },
  });
  if (!order) {
    notFound();
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
          imageUrl: true,
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
          imageUrl: true,
        },
      },
    },
  });
  if (!orderItem) {
    notFound();
  }
  return {
    ...orderItem,
    price: Number(orderItem.price),
  };
}
