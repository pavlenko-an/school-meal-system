import { OrderRepository } from "../infrastructure/order.repository";
import { getMyOrganizationStatsInput } from "../model/order.types";
import { OrderPermissionPolicy } from "../domain/order-permission.policy";
import { CurrentUser } from "@/shared/auth/current-user";

export class GetMyOrganizationStatsUseCase {
  constructor(private readonly orderRepo: OrderRepository) {}

  async execute(data: getMyOrganizationStatsInput, currentUser: CurrentUser) {
    OrderPermissionPolicy.canViewOrganizationData(currentUser);

    const { baseFilters, startOfToday } = this.buildBaseFilters(currentUser);
    const { from, to } = data;

    const recentOrders = await this.orderRepo.findRecentOrders(
      baseFilters,
      startOfToday,
      5,
    );
    const upcomingOrders = await this.orderRepo.findUpcomingOrders(
      baseFilters,
      startOfToday,
      5,
    );

    const countFilters = {
      ...baseFilters,
      deliveryDate: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
        lt: startOfToday,
      },
    };
    const ordersCount = await this.orderRepo.count(countFilters);
    const unpaidAmount = await this.orderRepo.sumUnpaidOrders(
      countFilters,
    );
    const nextDelivery = await this.orderRepo.findNextDelivery(
      baseFilters,
      startOfToday,
    );

    return {
      recent: recentOrders,
      upcoming: upcomingOrders,
      stats: {
        ordersCount,
        unpaidAmount,
        nextDelivery,
      },
    };
  }

  private buildBaseFilters(currentUser: CurrentUser) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const baseFilters = {
      ...(currentUser.organizationType === "school" && {
        schoolId: currentUser.organizationId,
      }),
      ...(currentUser.organizationType === "supplier" && {
        supplierId: currentUser.organizationId,
      }),
    };

    return { baseFilters, startOfToday };
  }
}
