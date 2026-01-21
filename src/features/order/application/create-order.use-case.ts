import { CurrentUser } from "@/shared/auth/current-user";
import { OrderRepository } from "../infrastructure/order.repository";
import { createOrderInput } from "../model/order.types";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { OrganizationRepository } from "@/features/organization/infrastructure/organization.repository";

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly orgRepo: OrganizationRepository,
  ) {}

  async execute(data: createOrderInput, currentUser: CurrentUser) {
    OrderPermissionPolicy.canCreateOrder(currentUser);
    const existingOrg = await this.orgRepo.findById(
      currentUser.organizationId!,
    );
    if (!existingOrg) {
      throw new NotFoundError("School not found");
    }
    const order = await this.orderRepo.create(data, currentUser);
    return order;
  }
}
