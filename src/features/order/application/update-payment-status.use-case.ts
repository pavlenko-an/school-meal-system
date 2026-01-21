import { CurrentUser } from "@/shared/auth/current-user";
import { updatePaymentStatusInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { OrderRepository } from "../infrastructure/order.repository";
import { ConflictError } from "@/shared/errors/conflict.error";
import { canTransitionPaymentStatus } from "../domain/payment-status-machine";

export class UpdatePaymentStatusUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(data: updatePaymentStatusInput, currentUser: CurrentUser) {
    const order = await this.orderRepo.findById(data.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    const { isSchool, isSupplier } = OrderPermissionPolicy.canChangeStatus(
      currentUser,
      order,
    );
    const { allowed, reason } = canTransitionPaymentStatus(
      order.paymentStatus,
      data.status,
      isSchool,
      isSupplier,
      order.orderStatus,
    );
    if (!allowed) throw new ConflictError(reason);
    return this.orderRepo.updatePaymentStatus(data.id, data.status);
  }
}
