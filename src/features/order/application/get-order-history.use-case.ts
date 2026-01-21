import { CurrentUser } from "@/shared/auth/current-user";
import { OrderRepository } from "../infrastructure/order.repository";
import { getOrderHistoryInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { NotFoundError } from "@/shared/errors/not-found.error";

export class GetOrderHistoryUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(data: getOrderHistoryInput, currentUser: CurrentUser) {
    const order = await this.orderRepo.findById(data.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    OrderPermissionPolicy.canViewOrderById(currentUser, order);
    const history = await this.orderRepo.findHistoryByOrderId(data.id);
    return history;
  }
}
