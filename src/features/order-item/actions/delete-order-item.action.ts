"use server";

import { getCurrentUser } from "@/shared/auth/current-user";
import { prisma } from "@/shared/db/prisma";
import { deleteOrderItemInput } from "../model/order-item.types";
import { deleteOrderItemSchema } from "../model/delete-order-item.schema";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteOrderItem(
  prevState: ActionResult | null = null,
  formData: FormData | deleteOrderItemInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = deleteOrderItemSchema.parse(rawData);
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть видаляти позиції замовлення",
      };
    }
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: data.id },
      include: { order: true },
    });
    if (!orderItem) {
      return {
        success: false,
        error: "Позиція замовлення не знайдена",
      };
    }
    if (orderItem.order.orderStatus !== "new") {
      return {
        success: false,
        error: "Неможливо видалити позиції з замовлення, яке не є новим",
      };
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
    return { success: true, message: "Позиція замовлення успішно видалена" };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити позицію замовлення",
    };
  }
}
