import { Prisma } from "@/generated/prisma/client";
import { OrderRepository } from "../infrastructure/order.repository";
import { getAllOrdersInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { CurrentUser } from "@/shared/auth/current-user";
import { OrganizationRepository } from "@/features/organization/infrastructure/organization.repository";

export class GetAllOrdersUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly orgRepo: OrganizationRepository,
  ) {}

  async execute(data: getAllOrdersInput, currentUser: CurrentUser) {
    OrderPermissionPolicy.canViewAllOrders(currentUser);

    if (data.schoolId) {
      const school = await this.orgRepo.findById(data.schoolId);
      if (!school) throw new NotFoundError("School not found");
    }

    if (data.supplierId) {
      const supplier = await this.orgRepo.findById(data.supplierId);
      if (!supplier) throw new NotFoundError("Supplier not found");
    }

    const filters: Prisma.OrderWhereInput[] = [];
    if (data.schoolId) filters.push({ schoolId: data.schoolId });
    if (data.supplierId) filters.push({ supplierId: data.supplierId });
    if (data.from) filters.push({ createdAt: { gte: data.from } });
    if (data.to) filters.push({ createdAt: { lte: data.to } });
    if (data.orderStatus) filters.push({ orderStatus: data.orderStatus });
    if (data.paymentStatus) filters.push({ paymentStatus: data.paymentStatus });

    return this.orderRepo.findAll(
      filters.length > 0 ? { AND: filters } : {},
      data.page,
      data.limit,
    );
  }
}
