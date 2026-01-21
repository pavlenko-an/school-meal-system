import { OrderRepository } from "../infrastructure/order.repository";
import { GetMyOrganizationStatsUseCase } from "../application/get-my-organization-stats.use-case";
import { GetMyOrganizationOrdersUseCase } from "../application/get-my-organization-orders.use-case";
import { CreateOrderUseCase } from "../application/create-order.use-case";
import { DeleteOrderUseCase } from "../application/delete-order.use-case";
import { OrganizationRepository } from "@/features/organization/infrastructure/organization.repository";
import { GetAllOrdersUseCase } from "../application/get-all-orders.use-case";
import { GetOrderByIdUseCase } from "../application/get-order-by-id.use-case";
import { GetOrderHistoryUseCase } from "../application/get-order-history.use-case";
import { UpdateOrderUseCase } from "../application/update-order.use-case";
import { UpdateOrderStatusUseCase } from "../application/update-order-status.use-case";
import { UpdatePaymentStatusUseCase } from "../application/update-payment-status.use-case";

const orderRepo = new OrderRepository();
const orgRepo = new OrganizationRepository();

export const orderService = {
  createOrder: new CreateOrderUseCase(orderRepo, orgRepo),
  deleteOrder: new DeleteOrderUseCase(orderRepo),
  getAllOrders: new GetAllOrdersUseCase(orderRepo, orgRepo),
  getMyOrganizationStats: new GetMyOrganizationStatsUseCase(orderRepo),
  getMyOrganizationOrders: new GetMyOrganizationOrdersUseCase(orderRepo),
  getOrderById: new GetOrderByIdUseCase(orderRepo),
  getOrderHistory: new GetOrderHistoryUseCase(orderRepo),
  updateOrder: new UpdateOrderUseCase(orderRepo),
  updateOrderStatus: new UpdateOrderStatusUseCase(orderRepo),
  updatePaymentStatus: new UpdatePaymentStatusUseCase(orderRepo),
};
