import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  createOrderItemInput,
  deleteOrderItemInput,
  updateOrderItemInput,
} from "./types";

export const OrderItemService = {
  async create(data: createOrderItemInput) {
    const [existingOrder, existingMenuItem] = await Promise.all([
      prisma.order.findUnique({
        where: { id: data.orderId },
        include: { orderItems: true },
      }),
      prisma.menuItem.findUnique({ where: { id: data.menuItemId } }),
    ]);
    if (!existingOrder) throw new Error("Замовлення не знайдено");
    if (!existingMenuItem) throw new Error("Пункт меню не знайдено");
    if (existingOrder.orderStatus !== "draft")
      throw new Error("Неможливо додати позиції до замовлення, яке не є чернеткою");

    const totalPrice = existingOrder.orderItems
      .reduce(
        (acc, item) => acc.plus(item.price.mul(item.quantity)),
        new Prisma.Decimal(0),
      )
      .plus(existingMenuItem.price.mul(data.quantity));

    const [orderItem] = await prisma.$transaction([
      prisma.orderItem.create({
        data: {
          orderId: data.orderId,
          menuItemId: data.menuItemId,
          quantity: data.quantity,
          price: existingMenuItem.price,
        },
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
      }),
      prisma.order.update({
        where: { id: existingOrder.id },
        data: { totalPrice },
      }),
    ]);

    return {
      ...orderItem,
      price: Number(orderItem.price),
    };
  },

  async update(data: updateOrderItemInput) {
    const existingOrderItem = await prisma.orderItem.findUnique({
      where: { id: data.id },
      include: { order: { include: { orderItems: true } } },
    });

    if (!existingOrderItem) {
      throw new Error("Позиція замовлення не знайдена");
    }
    if (existingOrderItem.order.orderStatus !== "draft") {
      throw new Error("Неможливо оновити позиції замовлення, яке не є чернеткою");
    }

    const quantity = data.quantity ?? existingOrderItem.quantity;
    const lineTotal = existingOrderItem.price.mul(quantity);
    const totalPrice = existingOrderItem.order.orderItems.reduce(
      (acc, item) => {
        if (item.id === data.id) {
          return acc.plus(lineTotal);
        }
        return acc.plus(item.price.mul(item.quantity));
      },
      new Prisma.Decimal(0),
    );

    const updatedOrderItem = await prisma.$transaction(async (tx) => {
      const updatedOrderItem = await tx.orderItem.update({
        where: { id: data.id },
        data: {
          quantity,
        },
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
      await tx.order.update({
        where: { id: existingOrderItem.order.id },
        data: { totalPrice },
      });
      return updatedOrderItem;
    });
    return {
      ...updatedOrderItem,
      price: Number(updatedOrderItem.price),
    };
  },

  async delete(data: deleteOrderItemInput) {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: data.id },
      include: { order: true },
    });
    if (!orderItem) {
      throw new Error("Позиція замовлення не знайдена");
    }
    if (orderItem.order.orderStatus !== "draft") {
      throw new Error(
        "Неможливо видалити позиції з замовлення, яке не є чернеткою",
      );
    }
    const totalPrice = orderItem.order.totalPrice.sub(orderItem.price);
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.delete({
        where: { id: data.id },
      });
      await tx.order.update({
        where: { id: orderItem.order.id },
        data: { totalPrice },
      });
    });
  },
};
