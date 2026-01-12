import { prisma } from "@/shared/db/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";
import {
  createOrderInput,
  deleteOrderInput,
  getAllOrdersInput,
  getCurrentOrganizationOrdersInput,
  getOrderByIdInput,
  updateOrderInput,
} from "../model/order.types";
import { ConflictError } from "@/shared/errors/conflict.error";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";

export async function getAllOrders(data: getAllOrdersInput) {
  const school = data.schoolId
    ? await prisma.organization.findUnique({
        where: { id: data.schoolId },
      })
    : null;
  if (data.schoolId && !school) {
    throw new NotFoundError("School not found");
  }
  const supplier = data.supplierId
    ? await prisma.organization.findUnique({
        where: { id: data.supplierId },
      })
    : null;
  if (data.supplierId && !supplier) {
    throw new NotFoundError("Supplier not found");
  }

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        data.schoolId ? { schoolId: data.schoolId } : undefined,
        data.supplierId ? { supplierId: data.supplierId } : undefined,
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

export async function getSchoolOrders(
  data: getCurrentOrganizationOrdersInput,
  currentUser: CurrentUser
) {
  if (currentUser.organizationType !== "school") {
    throw new AccessDeniedError("Access denied");
  }
}

export async function getSupplierOrders(
  data: getCurrentOrganizationOrdersInput,
  currentUser: CurrentUser
) {
  if (currentUser.organizationType !== "supplier") {
    throw new AccessDeniedError("Access denied");
  }
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
      OR: [
        { schoolId: currentUser.organizationId },
        { supplierId: currentUser.organizationId },
      ],
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
  const existingOrg = await prisma.organization.findUnique({
    where: { id: data.schoolId },
  });
  if (!existingOrg) {
    throw new NotFoundError("School not found");
  }

  const order = await prisma.order.create({
    data: {
      schoolId: data.schoolId,
      deliveryDate: data.deliveryDate,
      status: "new",
      totalPrice: 0,
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
  if (data.comment !== undefined) {
    updateData.comment = data.comment || null;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedOrder;
}

export async function deleteOrder(
  data: deleteOrderInput,
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
  if (order.status !== "new") {
    throw new ConflictError("Cannot delete a non-new order");
  }
  await prisma.order.delete({
    where: { id: data.id },
  });
  return { message: "Order deleted successfully" };
}
