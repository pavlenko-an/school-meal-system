import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getMyOrganizationOrdersInput, OrdersList } from "../model/order.types";
import { CurrentUser } from "@/shared/auth/current-user";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { getMyOrganizationOrdersSchema } from "../model/get-my-organization-orders.schema";

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

  if (validated.orderStatus && validated.orderStatus !== "all") {
    filters.orderStatus = validated.orderStatus;
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
