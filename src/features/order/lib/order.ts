import { prisma } from "@/shared/db/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";
import {
  createOrderInput,
  getAllOrdersInput,
  getCurrentOrganizationOrdersInput,
  getOrderByIdInput,
  updateOrderInput,
} from "../model/order.types";
import { ConflictError } from "@/shared/errors/conflict.error";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";

export async function getAllOrders(data: getAllOrdersInput) {
  const existingOrganization = data.organizationId
    ? await prisma.organization.findUnique({
        where: { id: data.organizationId },
      })
    : null;
  if (data.organizationId && !existingOrganization) {
    throw new NotFoundError("Organization not found");
  }
  const orders = await prisma.order.findMany({
    where: {
      AND: [
        data.organizationId
          ? { organizationId: data.organizationId }
          : undefined,
        data.from ? { createdAt: { gte: data.from } } : undefined,
        data.to ? { createdAt: { lte: data.to } } : undefined,
        data.status ? { status: data.status } : undefined,
      ].filter(Boolean) as any[],
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return orders;
}

export async function getOrderById(data: getOrderByIdInput) {
  const order = await prisma.order.findUnique({
    where: { id: data.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  return order;
}

export async function getCurrentOrganizationOrders(
  data: getCurrentOrganizationOrdersInput,
  currentUser: CurrentUser
) {
  if (!currentUser.organizationId) {
    return [];
  }
  if (data.from && data.to && data.from > data.to) {
    throw new ConflictError("Invalid date range");
  }
  const orders = await prisma.order.findMany({
    where: {
      organizationId: currentUser.organizationId,
      AND: [
        data.from ? { deliveryDate: { gte: data.from } } : undefined,
        data.to ? { deliveryDate: { lte: data.to } } : undefined,
      ].filter(Boolean) as any[],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return orders;
}

export async function createOrder(
  data: createOrderInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Access denied");
  }
  const [existingOrg, existingCreator] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: data.organizationId },
    }),
    data.createdById
      ? prisma.user.findUnique({
          where: { id: data.createdById },
        })
      : null,
  ]);

  if (!existingOrg) {
    throw new NotFoundError("Organization not found");
  }
  if (!existingCreator && data.createdById) {
    throw new NotFoundError("Creator user not found");
  }

  const order = await prisma.order.create({
    data: {
      organizationId: data.organizationId,
      createdById: data.createdById || null,
      deliveryDate: data.deliveryDate,
      status: data.status || "new",
      totalPrice: data.totalPrice,
      comment: data.comment || null,
    },
  });
  return order;
}

export async function updateOrder(
  data: updateOrderInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Access denied");
  }
  const order = await prisma.order.findUnique({
    where: { id: data.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.status === "completed" || order.status === "cancelled") {
    throw new ConflictError("Cannot update a completed or cancelled order");
  }

  const updateData: Record<string, unknown> = {};
  if (data.deliveryDate !== undefined) {
    updateData.deliveryDate = data.deliveryDate;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.totalPrice !== undefined) {
    updateData.totalPrice = data.totalPrice;
  }
  if (data.comment !== undefined) {
    updateData.comment = data.comment || null;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedOrder;
}
