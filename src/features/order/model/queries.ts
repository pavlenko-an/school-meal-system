import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { CurrentUser } from "@/shared/auth/current-user";
import {
  getAllOrdersInput,
  getMyOrganizationOrdersInput,
  getMyOrganizationStatsInput,
  getOrderByIdInput,
  getOrderHistoryInput,
  OrderHistory,
  OrderInfo,
  OrdersList,
  OrdersStats,
} from "./types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import {
  getAllOrdersSchema,
  getMyOrganizationOrdersSchema,
  getMyOrganizationStatsSchema,
  getOrderByIdSchema,
  getOrderHistorySchema,
} from "./params.schemas";
import { NotFoundError } from "@/shared/errors/not-found.error";

export async function getAllOrders(
  data: getAllOrdersInput,
  currentUser: CurrentUser,
): Promise<OrderInfo[]> {
  const permission = OrderPermissionPolicy.canViewAllOrders(currentUser);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const validated = getAllOrdersSchema.parse(data);

  if (validated.schoolId) {
    const school = await prisma.organization.findUnique({
      where: { id: validated.schoolId },
    });
    if (!school) throw new NotFoundError("School not found");
  }

  if (validated.supplierId) {
    const supplier = await prisma.organization.findUnique({
      where: { id: validated.supplierId },
    });
    if (!supplier) throw new NotFoundError("Supplier not found");
  }

  const filters: Prisma.OrderWhereInput[] = [];
  if (validated.schoolId) filters.push({ schoolId: validated.schoolId });
  if (validated.supplierId) filters.push({ supplierId: validated.supplierId });
  if (validated.from) filters.push({ createdAt: { gte: validated.from } });
  if (validated.to) filters.push({ createdAt: { lte: validated.to } });
  if (validated.orderStatus)
    filters.push({ orderStatus: validated.orderStatus });
  if (validated.paymentStatus)
    filters.push({ paymentStatus: validated.paymentStatus });

  const orders = await prisma.order.findMany({
    where: filters.length > 0 ? { AND: filters } : {},
    skip: (validated.page - 1) * validated.limit,
    take: validated.limit,
    select: {
      id: true,
      deliveryDate: true,
      comment: true,
      orderStatus: true,
      paymentStatus: true,
      totalPrice: true,
      createdAt: true,
      publishedAt: true,
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
  return orders.map((order) => ({
    ...order,
    totalPrice: Number(order.totalPrice),
  }));
}

export async function getMyOrganizationOrders(
  data: getMyOrganizationOrdersInput,
  currentUser: CurrentUser,
): Promise<OrdersList> {
  const permission = OrderPermissionPolicy.canViewOrganizationData(currentUser);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const validated = getMyOrganizationOrdersSchema.parse(data);

  const page = validated.page && validated.page > 0 ? validated.page : 1;
  const limit = validated.limit && validated.limit > 0 ? validated.limit : 10;
  const skip = (page - 1) * limit;

  const filters: Prisma.OrderWhereInput = {
    ...(currentUser.organizationType === "school" && {
      schoolId: currentUser.organizationId,
    }),
    ...(currentUser.organizationType === "supplier" && {
      supplierId: currentUser.organizationId,
    }),
  };

  if (validated.orderStatus) {
    if (Array.isArray(validated.orderStatus)) {
      filters.orderStatus = { in: validated.orderStatus };
    } else if (validated.orderStatus !== "all") {
      filters.orderStatus = validated.orderStatus;
    }
  }

  if (validated.paymentStatus && validated.paymentStatus !== "all") {
    filters.paymentStatus = validated.paymentStatus;
  }
  if (validated.from || validated.to) {
    filters.deliveryDate = {};
    if (validated.from) filters.deliveryDate.gte = validated.from;
    if (validated.to) filters.deliveryDate.lte = validated.to;
  }

  const [orders, total] = await Promise.all([
    await prisma.order.findMany({
      where: filters,
      take: limit,
      skip,
      select: {
        id: true,
        deliveryDate: true,
        orderStatus: true,
        paymentStatus: true,
        totalPrice: true,
        createdAt: true,
        publishedAt: true,
        comment: true,
        school: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { deliveryDate: "desc" },
    }),
    await prisma.order.count({ where: filters }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return {
    orders: orders.map((order) => ({
      ...order,
      totalPrice: Number(order.totalPrice),
    })),
    total,
    page,
    totalPages,
  };
}

export async function getMyOrganizationStats(
  data: getMyOrganizationStatsInput,
  currentUser: CurrentUser,
): Promise<OrdersStats> {
  const permission = OrderPermissionPolicy.canViewOrganizationData(currentUser);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const validated = getMyOrganizationStatsSchema.parse(data);

  const baseFilters: Prisma.OrderWhereInput = {
    ...(currentUser.organizationType === "school" && {
      schoolId: currentUser.organizationId,
    }),
    ...(currentUser.organizationType === "supplier" && {
      supplierId: currentUser.organizationId,
    }),
  };

  const allowedStatuses = validated.statuses ?? [
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const hasDateFilter = !!validated.from || !!validated.to;

  let recent: OrderInfo[] = [];
  let upcoming: OrderInfo[] = [];

  if (!hasDateFilter) {
    const lastOrders = await prisma.order.findMany({
      where: {
        ...baseFilters,
        orderStatus: { in: allowedStatuses },
        deliveryDate: { lte: new Date() },
      },
      select: {
        id: true,
        deliveryDate: true,
        orderStatus: true,
        paymentStatus: true,
        totalPrice: true,
        createdAt: true,
        publishedAt: true,
        comment: true,
        school: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: [{ deliveryDate: "desc" }],
      take: 5,
    });

    recent = lastOrders.map((o) => ({
      ...o,
      totalPrice: Number(o.totalPrice),
    })) as OrderInfo[];

    const futureOrders = await prisma.order.findMany({
      where: {
        ...baseFilters,
        orderStatus: { in: allowedStatuses },
        deliveryDate: { gte: new Date() },
      },
      select: {
        id: true,
        deliveryDate: true,
        orderStatus: true,
        paymentStatus: true,
        totalPrice: true,
        createdAt: true,
        publishedAt: true,
        comment: true,
        school: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { deliveryDate: "asc" },
      take: 5,
    });

    upcoming = futureOrders.map((o) => ({
      ...o,
      totalPrice: Number(o.totalPrice),
    })) as OrderInfo[];
  }

  const countWhere: Prisma.OrderWhereInput = {
    ...baseFilters,
    orderStatus: { in: allowedStatuses },
    ...(hasDateFilter && {
      deliveryDate: {
        ...(validated.from && { gte: validated.from }),
        ...(validated.to && { lte: validated.to }),
      },
    }),
  };

  const totalOrders = await prisma.order.count({ where: countWhere });

  const activeCountWhere: Prisma.OrderWhereInput = {
    ...baseFilters,
    orderStatus: { in: ["accepted", "in_progress"] },
    ...(hasDateFilter && {
      deliveryDate: {
        ...(validated.from && { gte: validated.from }),
        ...(validated.to && { lte: validated.to }),
      },
    }),
  };

  const activeOrders = await prisma.order.count({ where: activeCountWhere });

  const upcomingDeliveryRecord = await prisma.order.findFirst({
    where: {
      ...baseFilters,
      deliveryDate: { gte: new Date() },
      orderStatus: { in: ["accepted", "in_progress"] },
    },
    orderBy: { deliveryDate: "asc" },
    select: {
      deliveryDate: true,
      comment: true,
      totalPrice: true,
      school: { select: { name: true } },
      supplier: { select: { name: true } },
    },
  });

  const upcomingDelivery = upcomingDeliveryRecord
    ? {
        deliveryDate: upcomingDeliveryRecord.deliveryDate ?? null,
        organizationName:
          currentUser.organizationType === "supplier"
            ? (upcomingDeliveryRecord.school?.name ?? null)
            : (upcomingDeliveryRecord.supplier?.name ?? null),
        comment: upcomingDeliveryRecord.comment ?? null,
      }
    : null;

  const unpaidWhere: Prisma.OrderWhereInput = {
    ...baseFilters,
    paymentStatus: "unpaid",
    orderStatus: { not: "cancelled" },
    ...(hasDateFilter && {
      deliveryDate: {
        ...(validated.from && { gte: validated.from }),
        ...(validated.to && { lte: validated.to }),
      },
    }),
  };

  const unpaidAgg = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: unpaidWhere,
  });

  const totalUnpaid = Number(unpaidAgg._sum.totalPrice ?? 0);

  return {
    recent,
    upcoming,
    stats: {
      totalOrders,
      activeOrders,
      upcomingDelivery,
      totalUnpaid,
    },
  };
}

export async function getOrderById(
  data: getOrderByIdInput,
  currentUser: CurrentUser,
): Promise<OrderInfo> {
  const validated = getOrderByIdSchema.parse(data);
  const order = await prisma.order.findUnique({
    where: { id: validated.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  const permission = OrderPermissionPolicy.canViewOrderById(currentUser, order);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const resultOrder = await prisma.order.findUnique({
    where: { id: validated.id },
    select: {
      id: true,
      deliveryDate: true,
      comment: true,
      orderStatus: true,
      paymentStatus: true,
      totalPrice: true,
      createdAt: true,
      publishedAt: true,
      school: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
  });
  if (!resultOrder) {
    throw new NotFoundError("Order not found");
  }
  return {
    ...resultOrder,
    totalPrice: resultOrder.totalPrice.toNumber(),
  };
}

export async function getOrderHistory(
  data: getOrderHistoryInput,
  currentUser: CurrentUser,
): Promise<OrderHistory[]> {
  const validated = getOrderHistorySchema.parse(data);
  const order = await prisma.order.findUnique({
    where: { id: validated.id },
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  const permission = OrderPermissionPolicy.canViewOrderById(currentUser, order);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const history = await prisma.orderStatusHistory.findMany({
    where: {
      orderId: validated.id,
    },
    orderBy: {
      changedAt: "asc",
    },
    select: {
      id: true,
      previousStatus: true,
      newStatus: true,
      changedAt: true,
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
