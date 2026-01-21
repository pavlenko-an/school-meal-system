import { CurrentUser } from "@/shared/auth/current-user";
import { OrderRepository } from "../infrastructure/order.repository";
import { getOrderByIdInput } from "../model/order.types";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(data: getOrderByIdInput, currentUser: CurrentUser) {
    {
      const order = await this.orderRepo.findById(data.id);
      if (!order) {
        throw new NotFoundError("Order not found");
      }
      OrderPermissionPolicy.canViewOrderById(currentUser, order);
      return order;
    }
  }
}
