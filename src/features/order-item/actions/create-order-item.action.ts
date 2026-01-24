"use server";

import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/shared/auth/current-user";
import { createOrderItemSchema } from "../model/create-order-item.schema";
import { createOrderItemInput, OrderItemInfo } from "../model/order-item.types";

type ActionResult =
  | { success: true; data: OrderItemInfo }
  | { success: false; error: string };

export async function createOrderItem(
  prevState: ActionResult | null = null,
  formData: FormData | createOrderItemInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = createOrderItemSchema.parse(rawData);
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть створювати позиції замовлення",
      };
    }

    const [existingOrder, existingMenuItem] = await Promise.all([
      prisma.order.findUnique({
        where: { id: data.orderId },
        include: { orderItems: true },
      }),
      prisma.menuItem.findUnique({ where: { id: data.menuItemId } }),
    ]);
    if (!existingOrder)
      return {
        success: false,
        error: "Замовлення не знайдено",
      };
    if (!existingMenuItem)
      return {
        success: false,
        error: "Пункт меню не знайдено",
      };
    if (existingOrder.orderStatus !== "new")
      return {
        success: false,
        error: "Неможливо додати позиції до замовлення, яке не є новим",
      };

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
      success: true,
      data: {
        ...orderItem,
        price: Number(orderItem.price),
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити позицію замовлення",
    };
  }
}
