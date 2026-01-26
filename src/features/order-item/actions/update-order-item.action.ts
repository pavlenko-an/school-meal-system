"use server";

import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { OrderItemInfo, updateOrderItemInput } from "../model/order-item.types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { updateOrderItemSchema } from "../model/update-order-item.schema";

type ActionResult =
  | { success: true; data: OrderItemInfo }
  | { success: false; error: string };

export async function updateOrderItem(
  prevState: ActionResult | null = null,
  formData: FormData | updateOrderItemInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = updateOrderItemSchema.parse(rawData);
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть оновлювати позиції замовлення",
      };
    }
    const existingOrderItem = await prisma.orderItem.findUnique({
      where: { id: data.id },
      include: { order: { include: { orderItems: true } } },
    });

    if (!existingOrderItem) {
      return {
        success: false,
        error: "Позиція замовлення не знайдена",
      };
    }
    if (existingOrderItem.order.orderStatus !== "new") {
      return {
        success: false,
        error: "Неможливо оновити позиції замовлення, яке не є новим",
      };
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
      await tx.order.update({
        where: { id: existingOrderItem.order.id },
        data: { totalPrice },
      });
      return updatedOrderItem;
    });

    return {
      success: true,
      data: {
        ...updatedOrderItem,
        price: Number(updatedOrderItem.price),
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити позицію замовлення",
    };
  }
}
