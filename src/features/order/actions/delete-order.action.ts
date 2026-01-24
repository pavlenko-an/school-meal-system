"use server";

import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";
import { deleteOrderInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { deleteOrderSchema } from "../model/delete-order.schema";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteOrder(
  prevState: ActionResult | null = null,
  formData: FormData | deleteOrderInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = deleteOrderSchema.parse(rawData);
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
        error: "Лише нові замовлення можна видаляти",
      };
    }
    const permission = OrderPermissionPolicy.canDeleteOrder(currentUser, order);
    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Відмовлено в доступі",
      };
    }
    await prisma.order.delete({
      where: { id: data.id },
    });
    return { success: true, message: "Замовлення успішно видалено" };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити замовлення",
    };
  }
}
