import { prisma } from "@/shared/db/prisma";
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
  let orders;
  if (currentUser.organizationType === "school") {
    orders = await prisma.order.findMany({
      where: {
        schoolId: currentUser.organizationId,
        AND: [
          data.from ? { deliveryDate: { gte: data.from } } : undefined,
          data.to ? { deliveryDate: { lte: data.to } } : undefined,
        ].filter(Boolean) as any[],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: data.limit ?? 20,
      skip: data.offset ?? 0,
    });
  }
  if (currentUser.organizationType === "supplier") {
    orders = await prisma.order.findMany({
      where: {
        supplierId: currentUser.organizationId,
        AND: [
          data.from ? { deliveryDate: { gte: data.from } } : undefined,
          data.to ? { deliveryDate: { lte: data.to } } : undefined,
        ].filter(Boolean) as any[],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: data.limit ?? 20,
      skip: data.offset ?? 0,
    });
  }
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
  if (currentUser.organizationId !== data.schoolId) {
    throw new AccessDeniedError("Access denied");
  }
  if (currentUser.organizationType !== "school") {
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
  const isSupplier =
    currentUser.organizationType === "supplier" &&
    currentUser.organizationId === order.supplierId;

  if (!isSchool && !isSupplier) {
    throw new AccessDeniedError("You are not a participant of this order");
  }

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
      if ((toStatus === "accepted" || toStatus === "cancelled") && isSchool) {
        allowed = true;
      } else {
        reason = "From 'published' only → accepted / cancelled by school";
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

  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: data.id },
      data: { orderStatus: toStatus },
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
