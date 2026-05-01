import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { CurrentUser } from "@/shared/auth/current-user";
import {
  getAllOrdersInput,
  getMyOrganizationStatsInput,
  getOrderByIdInput,
  getOrderHistoryInput,
  getPublishedOrdersInput,
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
  getPublishedOrdersSchema,
} from "./params.schemas";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

export async function getAllOrders(
  data: getAllOrdersInput,
  currentUser: CurrentUser,
): Promise<OrdersList> {
  const permission = OrderPermissionPolicy.canViewAllOrders(currentUser);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const validated = getAllOrdersSchema.parse(data);

  const page = validated.page && validated.page > 0 ? validated.page : 1;
  const limit = validated.limit && validated.limit > 0 ? validated.limit : 10;
  const skip = (page - 1) * limit;

  if (validated.schoolId) {
    const school = await prisma.organization.findUnique({
      where: { id: validated.schoolId },
    });
    if (!school) notFound();
  }

  if (validated.supplierId) {
    const supplier = await prisma.organization.findUnique({
      where: { id: validated.supplierId },
    });
    if (!supplier) notFound();
  }

  const filters: Prisma.OrderWhereInput[] = [];
  if (validated.schoolId) filters.push({ schoolId: validated.schoolId });
  if (validated.supplierId) filters.push({ supplierId: validated.supplierId });
  if (validated.from) filters.push({ deliveryDate: { gte: validated.from } });
  if (validated.to) filters.push({ deliveryDate: { lte: validated.to } });
  if (validated.orderStatus)
    filters.push({ orderStatus: validated.orderStatus });
  if (validated.paymentStatus)
    filters.push({ paymentStatus: validated.paymentStatus });

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: filters.length > 0 ? { AND: filters } : {},
      skip: skip,
      take: limit,
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
      orderBy: { deliveryDate: "desc" },
    }),
    prisma.order.count({
      where: filters.length > 0 ? { AND: filters } : {},
    }),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    orders: orders.map((order) => ({
      ...order,
      totalPrice: Number(order.totalPrice),
    })),
    page,
    totalPages,
    total,
  };
}

export async function getAllOrdersStats(limit = 5) {
  return unstable_cache(
    async () => {
      console.log(
        `[CACHE MISS/HIT CHECK] ${new Date().toISOString()} — выполняю реальные запросы к БД`,
      );

      const [total, byStatus, totalValue, unpaidValue, recentOrders] =
        await Promise.all([
          prisma.order.count(),

          prisma.order.groupBy({
            by: ["orderStatus"],
            _count: { id: true },
          }),

          prisma.order
            .aggregate({
              _sum: { totalPrice: true },
            })
            .then((r) => Number(r._sum.totalPrice ?? 0)),

          prisma.order
            .aggregate({
              _sum: { totalPrice: true },
              where: {
                paymentStatus: "unpaid",
                orderStatus: { not: "cancelled" },
              },
            })
            .then((r) => Number(r._sum.totalPrice ?? 0)),

          prisma.order.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              createdAt: true,
              totalPrice: true,
              orderStatus: true,
              school: { select: { name: true } },
              supplier: { select: { name: true } },
            },
          }),
        ]);

      const statusCounts = Object.fromEntries(
        byStatus.map((item) => [item.orderStatus, item._count.id]),
      );

      return {
        total,
        statusCounts: {
          published: statusCounts.published ?? 0,
          accepted: statusCounts.accepted ?? 0,
          in_progress: statusCounts.in_progress ?? 0,
          completed: statusCounts.completed ?? 0,
          cancelled: statusCounts.cancelled ?? 0,
        },
        totalValue,
        unpaidValue,
        recentOrders: recentOrders.map((o) => ({
          ...o,
          totalPrice: Number(o.totalPrice),
        })) as OrderInfo[],
      };
    },
    ["all-orders-stats", String(limit)],
    {
      revalidate: 300,
      tags: ["all-orders-stats"],
    },
  )();
}

export async function getMyOrganizationOrders(
  data: {
    orderStatus?: string | string[];
    paymentStatus?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  },
  currentUser: CurrentUser,
): Promise<OrdersList> {
  const permission = OrderPermissionPolicy.canViewOrganizationData(currentUser);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const validated = getMyOrganizationOrdersSchema.parse(data);

  const cacheKeyParts = [
    "org-orders",
    currentUser.organizationId!,
    currentUser.organizationType!,
    Array.isArray(validated.orderStatus)
      ? validated.orderStatus.join(",")
      : validated.orderStatus || "no-orderStatus",
    validated.paymentStatus || "no-paymentStatus",
    validated.from ? validated.from.toISOString() : "no-from",
    validated.to ? validated.to.toISOString() : "no-to",
    validated.page ? String(validated.page) : "1",
    validated.limit ? String(validated.limit) : "10",
  ];

  return unstable_cache(
    async () => {
      console.log(
        `[CACHE MISS/HIT CHECK] ${new Date().toISOString()} — выполняю реальные запросы к БД для org ${currentUser.organizationId}`,
      );

      const page = validated.page && validated.page > 0 ? validated.page : 1;
      const limit =
        validated.limit && validated.limit > 0 ? validated.limit : 10;
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

      console.log(
        `Получено ${orders.length} заказов из ${total} по фильтру для org ${currentUser.organizationId}`,
      );
      console.log(orders);

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
    },
    cacheKeyParts,
    {
      revalidate: 300,
      tags: [`org-orders-${currentUser.organizationId}`],
    },
  )();
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

  const cacheKeyParts = [
    "org-stats",
    currentUser.organizationId!,
    currentUser.organizationType!,
    validated.statuses?.sort().join(",") || "default",
  ];

  return unstable_cache(
    async () => {
      console.log(
        `[CACHE MISS/HIT CHECK] ${new Date().toISOString()} — выполняю реальные запросы к БД для org ${currentUser.organizationId}`,
      );

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

      let recent: OrderInfo[] = [];
      let upcoming: OrderInfo[] = [];

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

      const countWhere: Prisma.OrderWhereInput = {
        ...baseFilters,
        orderStatus: { in: allowedStatuses },
      };

      const totalOrders = await prisma.order.count({ where: countWhere });

      const activeCountWhere: Prisma.OrderWhereInput = {
        ...baseFilters,
        orderStatus: { in: ["accepted", "in_progress"] },
      };

      const activeOrders = await prisma.order.count({
        where: activeCountWhere,
      });

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
    },
    cacheKeyParts,
    {
      revalidate: 300,
      tags: [`org-stats-${currentUser.organizationId}`],
    },
  )();
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
    notFound();
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
    notFound();
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
    notFound();
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

export async function getPublishedOrders(
  data: getPublishedOrdersInput,
  currentUser: CurrentUser,
): Promise<OrdersList> {
  const permission = OrderPermissionPolicy.canViewPublishedOrders(currentUser);
  if (!permission.allowed) {
    throw new AccessDeniedError(permission.reason || "Відмовлено в доступі");
  }
  const validated = getPublishedOrdersSchema.parse(data);

  const cacheKeyParts = [
    "published-orders",
    validated.from ? validated.from.toISOString() : "no-from",
    validated.to ? validated.to.toISOString() : "no-to",
    validated.page ? String(validated.page) : "1",
    validated.limit ? String(validated.limit) : "10",
  ];

  return unstable_cache(
    async () => {
      const page = validated.page && validated.page > 0 ? validated.page : 1;
      const limit =
        validated.limit && validated.limit > 0 ? validated.limit : 10;
      const skip = (page - 1) * limit;

      const filters: Prisma.OrderWhereInput = {
        orderStatus: "published",
      };

      if (validated.from || validated.to) {
        filters.deliveryDate = {};
        if (validated.from) filters.deliveryDate.gte = validated.from;
        if (validated.to) filters.deliveryDate.lte = validated.to;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
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
          orderBy: { deliveryDate: "asc" },
        }),
        prisma.order.count({ where: filters }),
      ]);

      console.log(
        `Получено ${orders.length} опубликованных заказов из ${total} по фильтру от ${validated.from} до ${validated.to}`,
      );
      console.log(orders);

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
    },
    cacheKeyParts,
    {
      revalidate: 300,
      tags: ["published-orders"],
    },
  )();
}
