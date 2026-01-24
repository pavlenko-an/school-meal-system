"use server";

import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";
import { OrderInfo, updateOrderInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { updateOrderSchema } from "../model/update-order.schema";

type ActionResult =
  | { success: true; order: OrderInfo }
  | { success: false; error: string };

export async function updateOrder(
  prevState: ActionResult | null = null,
  formData: FormData | updateOrderInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = updateOrderSchema.parse(rawData);
    const order = await prisma.order.findUnique({
      where: { id: data.id },
    });
    if (!order) {
      return {
        success: false,
        error: "Замовлення не знайдено",
      };
    }
    if (order.orderStatus !== "new") {
      return {
        success: false,
        error: "Неможливо оновити замовлення, яке не є новим",
      };
    }
    const permission = OrderPermissionPolicy.canUpdateOrder(currentUser, order);
    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Відмовлено в доступі",
      };
    }

    const updateData: Record<string, unknown> = {};
    if (data.deliveryDate !== undefined) {
      updateData.deliveryDate = data.deliveryDate;
    }
    if (data.comment !== undefined) {
      updateData.comment = data.comment ?? null;
    }
    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "Немає даних для оновлення" };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: data.id },
      data: updateData,
      select: {
        id: true,
        deliveryDate: true,
        comment: true,
        orderStatus: true,
        paymentStatus: true,
        totalPrice: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const resultOrder: OrderInfo = {
      ...updatedOrder,
      totalPrice: Number(updatedOrder.totalPrice),
    };
    return { success: true, order: resultOrder };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити замовлення",
    };
  }
}
