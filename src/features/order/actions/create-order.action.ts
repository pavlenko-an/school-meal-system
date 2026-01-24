"use server";

import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { OrderInfo } from "../model/order.types";

type ActionResult =
  | { success: true; order: OrderInfo }
  | { success: false; error: string };

export async function createOrder(
  prevState: ActionResult | null = null,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const permission = OrderPermissionPolicy.canCreateOrder(currentUser);
    if (!permission.allowed) {
      return {
        success: false,
        error: permission.reason || "Відмовлено в доступі",
      };
    }
    const existingOrg = await prisma.organization.findUnique({
      where: { id: currentUser.organizationId! },
    });
    if (!existingOrg) {
      return {
        success: false,
        error: "Організація не знайдена",
      };
    }
    const order = await prisma.order.create({
      data: {
        schoolId: currentUser.organizationId,
        deliveryDate: null,
        orderStatus: "new",
        paymentStatus: "unpaid",
        totalPrice: 0,
        comment: null,
      },
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
      ...order,
      totalPrice: Number(order.totalPrice),
    };

    return { success: true, order: resultOrder };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити замовлення",
    };
  }
}
