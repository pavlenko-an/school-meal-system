import { prisma } from "@/shared/db/prisma";
import { CurrentUser } from "@/shared/auth/current-user";
import {
  createOrderItemInput,
  getAllOrderItemsInput,
  getOrderItemByIdInput,
  updateOrderItemInput,
} from "../model/order-item.types";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ConflictError } from "@/shared/errors/conflict.error";

export async function getAllOrderItems(data: getAllOrderItemsInput) {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: data.orderId },
    take: data.limit,
    skip: data.offset,
  });
  return orderItems;
}

export async function getOrderItemById(data: getOrderItemByIdInput) {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: data.id },
  });
  if (!orderItem) {
    throw new NotFoundError("Order item not found");
  }
  return orderItem;
}

export async function createOrderItem(
  data: createOrderItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Access denied");
  }

  const [existingOrder, existingMenuItem] = await Promise.all([
    prisma.order.findUnique({ where: { id: data.orderId } }),
    prisma.menuItem.findUnique({ where: { id: data.menuItemId } }),
  ]);
  if (!existingOrder) {
    throw new NotFoundError("Order not found");
  }
  if (!existingMenuItem) {
    throw new NotFoundError("Menu item not found");
  }

  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: data.orderId,
      menuItemId: data.menuItemId,
      quantity: data.quantity ?? 1,
      price: data.price ?? existingMenuItem.price,
    },
  });
  return orderItem;
}

export async function updateOrderItem(
  data: updateOrderItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Access denied");
  }
  const existingOrderItem = await prisma.orderItem.findUnique({
    where: { id: data.id },
    include: { order: true },
  });
  if (!existingOrderItem) {
    throw new NotFoundError("Order item not found");
  }
  if (existingOrderItem.order.status !== "new") {
    throw new ConflictError("Cannot update items of a order that is not new");
  }

  const updateData: Record<string, unknown> = {};
  if (data.quantity !== undefined) {
    updateData.quantity = data.quantity;
  }

  const updatedOrderItem = await prisma.orderItem.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedOrderItem;
}
