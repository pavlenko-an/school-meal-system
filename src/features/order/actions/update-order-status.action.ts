"use server";

import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";
import { OrderInfo, updateOrderStatusInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { canTransitionOrderStatus } from "../domain/order-status-machine";
import { updateOrderStatusSchema } from "../model/update-order-status.schema";

type ActionResult =
  | { success: true; order: OrderInfo }
  | { success: false; error: string };

export async function updateOrderStatus(
  prevState: ActionResult | null = null,
  formData: FormData | updateOrderStatusInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = updateOrderStatusSchema.parse(rawData);
    const order = await prisma.order.findUnique({
      where: { id: data.id },
      include: {
        orderItems: {
          select: { id: true },
        },
      },
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
    const { allowed, reason, newSupplierId } = canTransitionOrderStatus(
      order,
      data.status,
      isSchool,
      isSupplier,
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
        data: { orderStatus: data.status, supplierId: newSupplierId },
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

      await tx.orderStatusHistory.create({
        data: {
          orderId: data.id,
          from: order.orderStatus,
          to: data.status,
          actorId: currentUser.id,
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
