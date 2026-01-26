import { prisma } from "@/shared/db/prisma";
import { CurrentUser } from "@/shared/auth/current-user";
import { getOrderByIdInput, OrderInfo } from "../model/order.types";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { getOrderByIdSchema } from "../model/get-order-by-id.schema";

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
