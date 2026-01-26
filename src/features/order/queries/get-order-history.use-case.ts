import { prisma } from "@/shared/db/prisma";
import { CurrentUser } from "@/shared/auth/current-user";
import { getOrderHistoryInput, OrderHistory } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { getOrderHistorySchema } from "../model/get-order-history.schema";

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
