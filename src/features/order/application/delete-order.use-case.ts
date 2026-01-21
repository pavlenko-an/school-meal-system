import { CurrentUser } from "@/shared/auth/current-user";
import { OrderRepository } from "../infrastructure/order.repository";
import { deleteOrderInput } from "../model/order.types";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ConflictError } from "@/shared/errors/conflict.error";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";

export class DeleteOrderUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(data: deleteOrderInput, currentUser: CurrentUser) {
    const order = await this.orderRepo.findById(data.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    if (order.orderStatus !== "new") {
      throw new ConflictError("Cannot delete a non-new order");
    }
    OrderPermissionPolicy.canDeleteOrder(currentUser, order);
    await this.orderRepo.delete(data.id);
    return { message: "Order deleted successfully" };
  }
}
