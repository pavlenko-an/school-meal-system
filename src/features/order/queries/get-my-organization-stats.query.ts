import { prisma } from "@/shared/db/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { getMyOrganizationStatsInput, OrdersStats } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { getMyOrganizationStatsSchema } from "../model/get-my-organization-stats.schema";

export async function getMyOrganizationStats(
  data: getMyOrganizationStatsInput,
  currentUser: CurrentUser,
): Promise<OrdersStats> {
  const permission = OrderPermissionPolicy.canViewOrganizationData(currentUser);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const validated = getMyOrganizationStatsSchema.parse(data);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const baseFilters: Prisma.OrderWhereInput = {
    ...(currentUser.organizationType === "school" && {
      schoolId: currentUser.organizationId,
    }),
    ...(currentUser.organizationType === "supplier" && {
      supplierId: currentUser.organizationId,
    }),
  };

  const recentWhere: Prisma.OrderWhereInput = {
    ...baseFilters,
    deliveryDate: { lt: startOfToday },
  };

  const recentOrders = await prisma.order.findMany({
    where: recentWhere,
    select: {
      id: true,
      deliveryDate: true,
      orderStatus: true,
      paymentStatus: true,
      totalPrice: true,
      createdAt: true,
      comment: true,
      school: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { deliveryDate: "desc" },
    take: 5,
  });

  const upcomingWhere: Prisma.OrderWhereInput = {
    ...baseFilters,
    deliveryDate: { gte: startOfToday },
  };

  const upcomingOrders = await prisma.order.findMany({
    where: upcomingWhere,
    select: {
      id: true,
      deliveryDate: true,
      orderStatus: true,
      paymentStatus: true,
      totalPrice: true,
      createdAt: true,
      comment: true,
      school: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
    orderBy: { deliveryDate: "asc" },
    take: 5,
  });

  const countFilters: Prisma.OrderWhereInput = {
    ...baseFilters,
    deliveryDate: {
      ...(validated.from && { gte: validated.from }),
      ...(validated.to && { lte: validated.to }),
      lt: startOfToday,
    },
  };

  const ordersCount = await prisma.order.count({ where: countFilters });

  const unpaidAmountAgg = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: {
      ...countFilters,
      paymentStatus: "unpaid",
      orderStatus: { not: "cancelled" },
    },
  });

  const unpaidAmount = Number(unpaidAmountAgg._sum.totalPrice ?? 0);

  const activeStatuses: OrderStatus[] = [
    "published",
    "accepted",
    "in_progress",
  ];

  const nextDeliveryRecord = await prisma.order.findFirst({
    where: {
      ...baseFilters,
      deliveryDate: { gte: startOfToday },
      orderStatus: { in: activeStatuses },
    },
    orderBy: { deliveryDate: "asc" },
    select: { deliveryDate: true, comment: true },
  });

  const nextDelivery = {
    deliveryDate: nextDeliveryRecord?.deliveryDate ?? null,
    comment: nextDeliveryRecord?.comment ?? null,
  };

  const recent = recentOrders.map((o) => ({
    ...o,
    totalPrice: Number(o.totalPrice),
  }));
  const upcoming = upcomingOrders.map((o) => ({
    ...o,
    totalPrice: Number(o.totalPrice),
  }));

  return {
    recent,
    upcoming,
    stats: {
      ordersCount,
      unpaidAmount,
      nextDelivery,
    },
  };
}
