import { prisma } from "@/shared/db/prisma";
import { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import { createOrderInput } from "../model/order.types";
import { CurrentUser } from "@/shared/auth/current-user";

export class OrderRepository {
  async findAll(
    filters: Prisma.OrderWhereInput,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where: filters,
      take: limit,
      skip,
      select: {
        id: true,
        deliveryDate: true,
        orderStatus: true,
        paymentStatus: true,
        totalPrice: true,
        school: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { deliveryDate: "desc" },
    });
    return orders.map((o) => ({ ...o, totalPrice: o.totalPrice.toNumber() }));
  }

  async findRecentOrders(
    baseFilters: Prisma.OrderWhereInput,
    startOfToday: Date,
    limit: number = 5,
  ) {
    const pastWhere: Prisma.OrderWhereInput = {
      ...baseFilters,
      deliveryDate: {
        lt: startOfToday,
      },
    };

    const db = await prisma.order.findMany({
      where: pastWhere,
      select: {
        id: true,
        deliveryDate: true,
        orderStatus: true,
        paymentStatus: true,
        totalPrice: true,
        school: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { deliveryDate: "desc" },
      take: limit,
    });

    return db.map((o) => ({ ...o, totalPrice: o.totalPrice.toNumber() }));
  }

  async findUpcomingOrders(
    baseFilters: Prisma.OrderWhereInput,
    startOfToday: Date,
    limit: number = 5,
  ) {
    const upcomingWhere: Prisma.OrderWhereInput = {
      ...baseFilters,
      deliveryDate: {
        gte: startOfToday,
      },
    };

    const db = await prisma.order.findMany({
      where: upcomingWhere,
      select: {
        id: true,
        deliveryDate: true,
        orderStatus: true,
        paymentStatus: true,
        totalPrice: true,
        school: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { deliveryDate: "asc" },
      take: limit,
    });

    return db.map((o) => ({ ...o, totalPrice: o.totalPrice.toNumber() }));
  }

  async findNextDelivery(
    baseFilters: Prisma.OrderWhereInput,
    startOfToday: Date,
  ) {
    const activeStatuses: OrderStatus[] = [
      "published",
      "accepted",
      "in_progress",
    ];
    const next = await prisma.order.findFirst({
      where: {
        ...baseFilters,
        deliveryDate: { gte: startOfToday },
        orderStatus: { in: activeStatuses },
      },
      orderBy: { deliveryDate: "asc" },
      select: { deliveryDate: true, comment: true },
    });
    return {
      deliveryDate: next?.deliveryDate ?? null,
      comment: next?.comment ?? null,
    };
  }

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
    });
    return order;
  }

  async findHistoryByOrderId(orderId: string) {
    return prisma.orderStatusHistory.findMany({
      where: {
        orderId,
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
  }

  async count(filters: Prisma.OrderWhereInput): Promise<number> {
    return prisma.order.count({ where: filters });
  }

  async sumUnpaidOrders(
    baseFilters: Prisma.OrderWhereInput,
    from?: Date,
    to?: Date,
  ): Promise<number> {
    const pastWhere: Prisma.OrderWhereInput = {
      ...baseFilters,
      deliveryDate: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
        lt: new Date(),
      },
    };
    const agg = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: {
        ...pastWhere,
        paymentStatus: "unpaid",
        orderStatus: { not: "cancelled" },
      },
    });
    return Number(agg._sum.totalPrice ?? 0);
  }

  async create(data: createOrderInput, currentUser: CurrentUser) {
    return prisma.order.create({
      data: {
        schoolId: currentUser.organizationId,
        deliveryDate: data.deliveryDate,
        orderStatus: "new",
        paymentStatus: "unpaid",
        totalPrice: 0,
        comment: data.comment || null,
      },
    });
  }

  async update(
    id: string,
    updateData: Partial<{ deliveryDate: Date; comment: string }>,
  ) {
    return prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  async updateOrderStatus(
    id: string,
    toStatus: OrderStatus,
    supplierId?: string,
    actorId?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { orderStatus: toStatus, supplierId },
      });

      if (actorId) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            from: updated.orderStatus,
            to: toStatus,
            actorId,
          },
        });
      }

      return updated;
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { paymentStatus: status },
      });
      return updated;
    });
  }

  async delete(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  }
}
