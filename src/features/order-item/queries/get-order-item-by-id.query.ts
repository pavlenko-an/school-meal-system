import { prisma } from "@/shared/db/prisma";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { getOrderItemByIdSchema } from "../model/get-order-item-by-id.schema";
import { getOrderItemByIdInput } from "../model/order-item.types";

export async function getOrderItemById(data: getOrderItemByIdInput) {
  const validated = getOrderItemByIdSchema.parse(data);
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: validated.id },
  });
  if (!orderItem) {
    throw new NotFoundError("Order item not found");
  }
  return orderItem;
}
