import { CurrentUser } from "@/shared/auth/current-user";
import { updateOrderStatusInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { OrderRepository } from "../infrastructure/order.repository";
import { canTransitionOrderStatus } from "../domain/order-status-machine";
import { ConflictError } from "@/shared/errors/conflict.error";

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(data: updateOrderStatusInput, currentUser: CurrentUser) {
    const order = await this.orderRepo.findById(data.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    const { isSchool, isSupplier } = OrderPermissionPolicy.canChangeStatus(
      currentUser,
      order,
    );
    const { allowed, reason, newSupplierId } = canTransitionOrderStatus(
      order.orderStatus,
      data.status,
      isSchool,
      isSupplier,
      order.paymentStatus,
    );
    if (!allowed) throw new ConflictError(reason);
    return this.orderRepo.updateOrderStatus(
      data.id,
      data.status,
      newSupplierId,
      currentUser.id,
    );
  }
}
