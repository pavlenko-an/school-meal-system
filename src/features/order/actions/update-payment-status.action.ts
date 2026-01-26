"use server";

import { prisma } from "@/shared/db/prisma";
import { OrderInfo, updatePaymentStatusInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { canTransitionPaymentStatus } from "../domain/payment-status-machine";
import { getCurrentUser } from "@/shared/auth/current-user";
import { updatePaymentStatusSchema } from "../model/update-payment-status.schema";

type ActionResult =
  | { success: true; order: OrderInfo }
  | { success: false; error: string };

export async function updatePaymentStatus(
  prevState: ActionResult | null = null,
  formData: FormData | updatePaymentStatusInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = updatePaymentStatusSchema.parse(rawData);
    const order = await prisma.order.findUnique({
      where: { id: data.id },
    });
    if (!order) {
      return {
        success: false,
        error: "Замовлення не знайдено",
      };
    }
    const permission = OrderPermissionPolicy.canChangeStatus(
      currentUser,
      order,
    );
    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Відмовлено в доступі",
      };
    }
    const { isSchool, isSupplier } = permission;
    const { allowed, reason } = canTransitionPaymentStatus(
      order.paymentStatus,
      data.status,
      isSchool,
      isSupplier,
      order.orderStatus,
    );
    if (!allowed) {
      return {
        success: false,
        error: reason || "Недопустима зміна статусу замовлення",
      };
    }
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: data.id },
        data: { paymentStatus: data.status },
        select: {
          id: true,
          deliveryDate: true,
          comment: true,
          orderStatus: true,
          paymentStatus: true,
          totalPrice: true,
          createdAt: true,
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
      return updated;
    });
    const resultOrder: OrderInfo = {
      ...updatedOrder,
      totalPrice: Number(updatedOrder.totalPrice),
    };
    return {
      success: true,
      order: resultOrder,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити статус замовлення",
    };
  }
}
