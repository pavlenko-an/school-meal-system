import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getAllOrdersInput, OrderInfo } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { getAllOrdersSchema } from "../model/get-all-orders.schema";

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
