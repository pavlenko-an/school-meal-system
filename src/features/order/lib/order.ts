import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NotFoundError } from "@/shared/errors/not-found.error";
import {
  createOrderInput,
  deleteOrderInput,
  getAllOrdersInput,
  getMyOrganizationOrdersInput,
  getOrderByIdInput,
  getOrderHistoryInput,
  updateOrderInput,
  updateOrderStatusInput,
  updatePaymentStatusInput,
} from "../model/order.types";
import { ConflictError } from "@/shared/errors/conflict.error";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";

export async function getAllOrders(
  data: getAllOrdersInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
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

  const filters: Prisma.OrderWhereInput[] = [];
  if (data.schoolId) {
    filters.push({ schoolId: data.schoolId });
  }
  if (data.supplierId) {
    filters.push({ supplierId: data.supplierId });
  }
  if (data.from) {
    filters.push({ createdAt: { gte: data.from } });
  }
  if (data.to) {
    filters.push({ createdAt: { lte: data.to } });
  }
  if (data.orderStatus) {
    filters.push({ orderStatus: data.orderStatus });
  }
  if (data.paymentStatus) {
    filters.push({ paymentStatus: data.paymentStatus });
  }

  const orders = await prisma.order.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return orders;
}

export async function getOrderById(
  data: getOrderByIdInput,
  currentUser: CurrentUser
) {
  const order = await prisma.order.findUnique({
    where: { id: data.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  const isSchoolMember =
    currentUser.organizationType === "school" &&
    currentUser.organizationId &&
    order.schoolId === currentUser.organizationId;
  const isSupplierMember =
    currentUser.organizationType === "supplier" &&
    currentUser.organizationId &&
    order.supplierId === currentUser.organizationId;
  const isAdmin = currentUser.role === "admin";
  if (!isSchoolMember && !isSupplierMember && !isAdmin) {
    throw new AccessDeniedError("Access denied");
  }
  return order;
}

export async function getMyOrganizationOrders(
  data: getMyOrganizationOrdersInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Access denied");
  }

  const filters: Prisma.OrderWhereInput = {
    ...(currentUser.organizationType === "school" && {
      schoolId: currentUser.organizationId,
    }),
    ...(currentUser.organizationType === "supplier" && {
      supplierId: currentUser.organizationId,
    }),
    ...(data.from && {
      deliveryDate: { gte: data.from },
    }),
    ...(data.to && {
      deliveryDate: { lte: data.to },
    }),
  };

  const orders = await prisma.order.findMany({
    where: filters,
    orderBy: {
      createdAt: "desc",
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });

  return orders;
}

export async function getOrderHistory(
  data: getOrderHistoryInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Only employees can view order history");
  }
  if (!currentUser.organizationId || !currentUser.organizationType) {
    throw new AccessDeniedError("User has no associated organization");
  }

  const order = await prisma.order.findUnique({
    where: { id: data.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isSchoolParticipant =
    currentUser.organizationType === "school" &&
    currentUser.organizationId === order.schoolId;
  const isSupplierParticipant =
    currentUser.organizationType === "supplier" &&
    currentUser.organizationId === order.supplierId;
  if (!isSchoolParticipant && !isSupplierParticipant) {
    throw new AccessDeniedError(
      "You do not have access to this order's history"
    );
  }

  const history = await prisma.orderStatusHistory.findMany({
    where: {
      orderId: data.id,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      from: true,
      to: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return history;
}

export async function createOrder(
  data: createOrderInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Access denied");
  }
  if (currentUser.organizationType !== "school") {
    throw new AccessDeniedError("Access denied");
  }
  const existingOrg = await prisma.organization.findUnique({
    where: { id: currentUser.organizationId ?? undefined },
  });
  if (!existingOrg) {
    throw new NotFoundError("School not found");
  }

  const order = await prisma.order.create({
    data: {
      schoolId: currentUser.organizationId,
      deliveryDate: data.deliveryDate,
      orderStatus: "new",
      paymentStatus: "unpaid",
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
  if (currentUser.organizationType !== "school") {
    throw new AccessDeniedError("Access denied");
  }
  const order = await prisma.order.findUnique({
    where: { id: data.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.orderStatus !== "new") {
    throw new ConflictError("Cannot update a non-new order");
  }
  if (currentUser.organizationId !== order.schoolId) {
    throw new AccessDeniedError("Access denied");
  }

  const updateData: Record<string, unknown> = {};
  if (data.deliveryDate !== undefined) {
    updateData.deliveryDate = data.deliveryDate;
  }
  if (data.comment !== undefined) {
    updateData.comment = data.comment ?? null;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: data.id },
    data: updateData,
  });
  return updatedOrder;
}

export async function updateOrderStatus(
  data: updateOrderStatusInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Only employees can change order status");
  }
  if (!currentUser.organizationId || !currentUser.organizationType) {
    throw new AccessDeniedError("User has no associated organization");
  }

  const order = await prisma.order.findUnique({
    where: { id: data.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const isSchool =
    currentUser.organizationType === "school" &&
    currentUser.organizationId === order.schoolId;
  let isSupplier =
    currentUser.organizationType === "supplier" &&
    currentUser.organizationId === order.supplierId;

  const fromStatus = order.orderStatus;
  const toStatus = data.status;
  if (fromStatus === toStatus) {
    throw new ConflictError("Order already in this status");
  }
  let allowed = false;
  let reason = "";

  switch (fromStatus) {
    case "new":
      if (toStatus === "published" && isSchool) {
        allowed = true;
      } else {
        reason = "From 'new' only → published is allowed and only by school";
      }
      break;

    case "published":
      if (
        toStatus === "accepted" &&
        currentUser.organizationType === "supplier"
      ) {
        if (!order.supplierId) {
          order.supplierId = currentUser.organizationId;
        } else if (order.supplierId !== currentUser.organizationId) {
          throw new AccessDeniedError(
            "Order is already assigned to another supplier"
          );
        }
        isSupplier = currentUser.organizationId === order.supplierId;
        allowed = true;
      } else if (toStatus === "cancelled" && isSchool) {
        allowed = true;
      } else {
        reason =
          "From 'published': 'accepted' only by supplier, 'cancelled' only by school";
      }
      break;

    case "accepted":
      if (toStatus === "in_progress" && isSupplier) {
        if (order.paymentStatus !== "verified") {
          throw new ConflictError(
            "Cannot start 'in_progress' until payment is verified"
          );
        }
        allowed = true;
      } else if (toStatus === "cancelled" && isSupplier) {
        if (order.paymentStatus !== "unpaid") {
          throw new ConflictError("Cannot cancel after payment is paid");
        }
        allowed = true;
      } else {
        reason =
          "From 'accepted' only → in_progress (verified) or cancelled (unpaid) by supplier";
      }
      break;

    case "in_progress":
      if (toStatus === "completed" && isSchool) {
        allowed = true;
      } else {
        reason = "From 'in_progress' only → completed by school";
      }
      break;

    case "completed":
      reason = "Final status — cannot be changed";
      break;

    case "cancelled":
      reason = "Final status — cannot be changed";
      break;

    default:
      reason = "Unknown current status";
  }

  if (!allowed) {
    throw new ConflictError(
      reason || `Transition ${fromStatus} → ${toStatus} not allowed`
    );
  }

  if (!isSchool && !isSupplier) {
    throw new AccessDeniedError("You are not a participant of this order");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: data.id },
      data: {
        orderStatus: toStatus,
        supplierId: order.supplierId,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: data.id,
        from: fromStatus,
        to: toStatus,
        actorId: currentUser.id,
      },
    });

    return updated;
  });
}

export async function updatePaymentStatus(
  data: updatePaymentStatusInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "employee") {
    throw new AccessDeniedError("Only employees can change payment status");
  }
  if (!currentUser.organizationId || !currentUser.organizationType) {
    throw new AccessDeniedError("User has no associated organization");
  }

  const order = await prisma.order.findUnique({
    where: { id: data.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const currentPayment = order.paymentStatus;
  const targetPayment = data.status;
  if (currentPayment === targetPayment) {
    throw new ConflictError("Payment already in this status");
  }
  let allowed = false;
  let errorMessage = "";

  const isSchool =
    currentUser.organizationType === "school" &&
    currentUser.organizationId === order.schoolId;
  const isSupplier =
    currentUser.organizationType === "supplier" &&
    currentUser.organizationId === order.supplierId;
  if (!isSchool && !isSupplier) {
    throw new AccessDeniedError("You are not a participant of this order");
  }

  switch (currentPayment) {
    case "unpaid":
      if (targetPayment === "paid" && isSchool) {
        if (order.orderStatus !== "accepted") {
          errorMessage =
            "Can only mark as paid when order is in 'accepted' status";
          break;
        }
        allowed = true;
      } else {
        errorMessage =
          "From 'unpaid' only 'paid' by school is allowed (and only in accepted)";
      }
      break;

    case "paid":
      if (targetPayment === "verified" && isSupplier) {
        if (order.orderStatus !== "accepted") {
          errorMessage =
            "Can only verify payment when order is in 'accepted' status";
          break;
        }
        allowed = true;
      } else {
        errorMessage =
          "From 'paid' only 'verified' by supplier is allowed (and only in accepted)";
      }
      break;

    case "verified":
      errorMessage = "Payment already verified — cannot change further";
      break;

    default:
      errorMessage = "Unknown current payment status";
  }

  if (!allowed) {
    throw new ConflictError(
      errorMessage || `Cannot transition ${currentPayment} → ${targetPayment}`
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: data.id },
      data: { paymentStatus: targetPayment },
    });

    return updatedOrder;
  });
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
  if (order.orderStatus !== "new") {
    throw new ConflictError("Cannot delete a non-new order");
  }
  if (currentUser.organizationId !== order.schoolId) {
    throw new AccessDeniedError("Access denied");
  }
  await prisma.order.delete({
    where: { id: data.id },
  });
  return { message: "Order deleted successfully" };
}
