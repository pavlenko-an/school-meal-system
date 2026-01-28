import { prisma } from "@/shared/db/prisma";
import {
  deleteOrderInput,
  updateOrderInput,
  updateOrderStatusInput,
  updatePaymentStatusInput,
} from "./types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { CurrentUser } from "@/shared/auth/current-user";
import { canTransitionOrderStatus } from "../domain/order-status-machine";
import { canTransitionPaymentStatus } from "../domain/payment-status-machine";

export const OrderService = {
  async create(user: CurrentUser) {
    const permission = OrderPermissionPolicy.canCreateOrder(user);
    if (!permission.allowed) {
      throw new Error(permission.reason || "Відмовлено в доступі");
    }
    const existingOrg = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });
    if (!existingOrg) {
      throw new Error("Організація не знайдена");
    }
    const order = await prisma.order.create({
      data: {
        schoolId: user.organizationId,
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

    return {
      ...order,
      totalPrice: Number(order.totalPrice),
    };
  },

  async update(data: updateOrderInput, user: CurrentUser) {
    const permission = OrderPermissionPolicy.canUpdateOrder(user);
    if (!permission.allowed) {
      throw new Error(permission.reason || "Відмовлено в доступі");
    }
    const order = await prisma.order.findUnique({
      where: { id: data.id },
    });
    if (!order) {
      throw new Error("Замовлення не знайдено");
    }
    if (order.orderStatus !== "new") {
      throw new Error("Неможливо оновити замовлення, яке не є новим");
    }
    if (user.organizationId !== order.schoolId) {
      throw new Error(
        "Неможливо змінити замовлення, яке не належить вашій школі",
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.deliveryDate !== undefined) {
      updateData.deliveryDate = data.deliveryDate;
    }
    if (data.comment !== undefined) {
      updateData.comment = data.comment ?? null;
    }
    if (Object.keys(updateData).length === 0) {
      throw new Error("Немає даних для оновлення");
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

    return {
      ...updatedOrder,
      totalPrice: Number(updatedOrder.totalPrice),
    };
  },

  async updateOrderStatus(data: updateOrderStatusInput, user: CurrentUser) {
    const order = await prisma.order.findUnique({
      where: { id: data.id },
      include: {
        orderItems: {
          select: { id: true },
        },
      },
    });
    if (!order) {
      throw new Error("Замовлення не знайдено");
    }
    const permission = OrderPermissionPolicy.canChangeStatus(user, order);
    if (!permission.allowed) {
      throw new Error(permission.reason || "Відмовлено в доступі");
    }
    const { isSchool, isSupplier } = permission;
    const { allowed, reason, newSupplierId } = canTransitionOrderStatus(
      order,
      data.status,
      isSchool,
      isSupplier,
    );
    if (!allowed) {
      throw new Error(reason || "Недопустима зміна статусу замовлення");
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

      await tx.orderStatusHistory.create({
        data: {
          orderId: data.id,
          previousStatus: order.orderStatus,
          newStatus: data.status,
          actorId: user.id,
        },
      });

      return updated;
    });

    return {
      ...updatedOrder,
      totalPrice: Number(updatedOrder.totalPrice),
    };
  },

  async updatePaymentStatus(data: updatePaymentStatusInput, user: CurrentUser) {
    const order = await prisma.order.findUnique({
      where: { id: data.id },
    });
    if (!order) {
      throw new Error("Замовлення не знайдено");
    }
    const permission = OrderPermissionPolicy.canChangeStatus(user, order);
    if (!permission.allowed) {
      throw new Error(permission.reason || "Відмовлено в доступі");
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
      throw new Error(reason || "Недопустима зміна статусу оплати");
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

    return {
      ...updatedOrder,
      totalPrice: Number(updatedOrder.totalPrice),
    };
  },

  async delete(data: deleteOrderInput, user: CurrentUser) {
    const order = await prisma.order.findUnique({
      where: { id: data.id },
    });
    if (!order) {
      throw new Error("Замовлення не знайдено");
    }
    if (order.orderStatus !== "new") {
      throw new Error("Лише нові замовлення можна видаляти");
    }
    const permission = OrderPermissionPolicy.canDeleteOrder(user, order);
    if (!permission.allowed) {
      throw new Error(permission.reason || "Відмовлено в доступі");
    }
    await prisma.order.delete({
      where: { id: data.id },
    });
  },
};
