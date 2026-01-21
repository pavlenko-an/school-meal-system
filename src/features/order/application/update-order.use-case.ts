import { CurrentUser } from "@/shared/auth/current-user";
import { updateOrderInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ConflictError } from "@/shared/errors/conflict.error";
import { OrderRepository } from "../infrastructure/order.repository";

export class UpdateOrderUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(data: updateOrderInput, currentUser: CurrentUser) {
    const order = await this.orderRepo.findById(data.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    if (order.orderStatus !== "new") {
      throw new ConflictError("Cannot update a non-new order");
    }
    OrderPermissionPolicy.canUpdateOrder(currentUser, order);

    const updateData: Record<string, unknown> = {};
    if (data.deliveryDate !== undefined) {
      updateData.deliveryDate = data.deliveryDate;
    }
    if (data.comment !== undefined) {
      updateData.comment = data.comment ?? null;
    }
    if (Object.keys(updateData).length === 0) {
      return order;
    }

    const updatedOrder = await this.orderRepo.update(data.id, updateData);
    return updatedOrder;
  }
}
