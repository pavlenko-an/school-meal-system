import { Prisma } from "@/generated/prisma/client";
import { OrderRepository } from "../infrastructure/order.repository";
import { getMyOrganizationOrdersInput } from "../model/order.types";
import { CurrentUser } from "@/shared/auth/current-user";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";

export class GetMyOrganizationOrdersUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(input: getMyOrganizationOrdersInput, currentUser: CurrentUser) {
    OrderPermissionPolicy.canViewOrganizationData(currentUser);

    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? input.limit : 10;

    const filters: Prisma.OrderWhereInput = {
      ...(currentUser.organizationType === "school" && {
        schoolId: currentUser.organizationId,
      }),
      ...(currentUser.organizationType === "supplier" && {
        supplierId: currentUser.organizationId,
      }),
    };

    if (input.orderStatus && input.orderStatus !== "all") {
      filters.orderStatus = input.orderStatus;
    }
    if (input.paymentStatus && input.paymentStatus !== "all") {
      filters.paymentStatus = input.paymentStatus;
    }
    if (input.from || input.to) {
      filters.deliveryDate = {};
      if (input.from) filters.deliveryDate.gte = input.from;
      if (input.to) filters.deliveryDate.lte = input.to;
    }

    const [orders, total] = await Promise.all([
      this.orderRepo.findAll(filters, page, limit),
      this.orderRepo.count(filters),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { orders, total, page, totalPages };
  }
}
