import { z } from "zod";
import { getAllOrdersSchema } from "./get-all-orders.schema";
import { getOrderByIdSchema } from "./get-order-by-id.schema";
import { updateOrderSchema } from "./update-order.schema";
import { getMyOrganizationStatsSchema } from "./get-my-organization-stats.schema";
import { deleteOrderSchema } from "./delete-order.schema";
import { updateOrderStatusSchema } from "./update-order-status.schema";
import { updatePaymentStatusSchema } from "./update-payment-status.schema";
import { getOrderHistorySchema } from "./get-order-history.schema";
import { getMyOrganizationOrdersSchema } from "./get-my-organization-orders.schema";
import { createOrderSchema } from "./create-order.schema";

export type getAllOrdersInput = z.infer<typeof getAllOrdersSchema>;
export type getOrderByIdInput = z.infer<typeof getOrderByIdSchema>;
export type getMyOrganizationStatsInput = z.infer<
  typeof getMyOrganizationStatsSchema
>;
export type getMyOrganizationOrdersInput = z.infer<
  typeof getMyOrganizationOrdersSchema
>;
export type getOrderHistoryInput = z.infer<typeof getOrderHistorySchema>;
export type createOrderInput = z.infer<typeof createOrderSchema>;
export type updateOrderInput = z.infer<typeof updateOrderSchema>;
export type updateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type updatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;
export type deleteOrderInput = z.infer<typeof deleteOrderSchema>;

export type OrderInfo = {
  id: string;
  deliveryDate: Date | null;
  comment: string | null;
  orderStatus:
    | "new"
    | "published"
    | "accepted"
    | "in_progress"
    | "completed"
    | "cancelled";
  paymentStatus: "unpaid" | "paid" | "verified";
  totalPrice: number;
  createdAt: Date;
  school: {
    id: string;
    name: string;
  } | null;
  supplier: {
    id: string;
    name: string;
  } | null;
};

export type OrdersList = {
  orders: OrderInfo[];
  total: number;
  page: number;
  totalPages: number;
};

export type OrdersStats = {
  recent: OrderInfo[];
  upcoming: OrderInfo[];
  stats: {
    ordersCount: number;
    nextDelivery: {
      deliveryDate: Date | null;
      comment: string | null;
    };
    unpaidAmount: number;
  };
};

export type OrderHistory = {
  id: string;
  previousStatus: string;
  newStatus: string;
  changedAt: Date;
  actor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
};
