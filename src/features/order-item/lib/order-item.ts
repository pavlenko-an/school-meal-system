import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { CurrentUser } from "@/shared/auth/current-user";
import {
  createOrderItemInput,
  deleteOrderItemInput,
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
    prisma.order.findUnique({
      where: { id: data.orderId },
      include: { orderItems: true },
    }),
    prisma.menuItem.findUnique({ where: { id: data.menuItemId } }),
  ]);
  if (!existingOrder) throw new NotFoundError("Order not found");
  if (!existingMenuItem) throw new NotFoundError("Menu item not found");
  if (existingOrder.status !== "new")
    throw new ConflictError("Cannot add items to a non-new order");

  const quantity = data.quantity ?? 1;
  const price = existingMenuItem.price.mul(quantity);

  const totalPrice = existingOrder.orderItems.reduce(
    (acc, item) => acc.plus(item.price),
    price
  );

  const [orderItem] = await prisma.$transaction([
    prisma.orderItem.create({
      data: {
        orderId: data.orderId,
        menuItemId: data.menuItemId,
        quantity,
        price,
      },
    }),
    prisma.order.update({
      where: { id: existingOrder.id },
      data: { totalPrice },
    }),
  ]);

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
    include: { order: { include: { orderItems: true } } },
  });

  if (!existingOrderItem) throw new NotFoundError("Order item not found");
  if (existingOrderItem.order.status !== "new") {
    throw new ConflictError("Cannot update items of a non-new order");
  }

  const quantity = data.quantity ?? existingOrderItem.quantity;
  const newPrice = existingOrderItem.price
    .div(existingOrderItem.quantity)
    .mul(quantity);

  const totalPrice = existingOrderItem.order.orderItems.reduce((acc, item) => {
    if (item.id === data.id) {
      return acc.plus(newPrice);
    }
    return acc.plus(item.price);
  }, new Prisma.Decimal(0));

  const updatedOrderItem = await prisma.$transaction(async (tx) => {
    const updatedOrderItem = await tx.orderItem.update({
      where: { id: data.id },
      data: {
        quantity,
        price: newPrice,
      },
    });
    await tx.order.update({
      where: { id: existingOrderItem.order.id },
      data: { totalPrice },
    });
    return updatedOrderItem;
  });

  return updatedOrderItem;
}

export async function deleteOrderItem(
  data: deleteOrderItemInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Access denied");
  }
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: data.id },
    include: { order: true },
  });
  if (!orderItem) throw new NotFoundError("Order item not found");
  if (orderItem.order.status !== "new") {
    throw new ConflictError("Cannot delete items from a non-new order");
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
  return { message: "Order item deleted successfully" };
}
