import { z } from "zod";
import {
  getAllOrdersSchema,
  getMyOrganizationOrdersSchema,
  getMyOrganizationStatsSchema,
  getOrderByIdSchema,
  getOrderHistorySchema,
} from "./params.schemas";
import {
  createOrderSchema,
  deleteOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "./input.schemas";

export type getAllOrdersInput = z.infer<typeof getAllOrdersSchema>;
export type getOrderByIdInput = z.infer<typeof getOrderByIdSchema>;
export type getMyOrganizationOrdersInput = z.infer<
  typeof getMyOrganizationOrdersSchema
>;
export type getMyOrganizationStatsInput = z.infer<
  typeof getMyOrganizationStatsSchema
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
    | "draft"
    | "published"
    | "accepted"
    | "in_progress"
    | "completed"
    | "cancelled";
  paymentStatus: "unpaid" | "paid" | "verified";
  totalPrice: number;
  createdAt: Date;
  publishedAt: Date | null;
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
    totalOrders: number;
    activeOrders: number;
    upcomingDelivery: {
      deliveryDate: Date | null;
      organizationName: string | null;
      comment: string | null;
    } | null;
    totalUnpaid: number;
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
