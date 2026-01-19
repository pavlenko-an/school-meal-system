import { z } from "zod";
import { getAllOrdersSchema } from "./get-all-orders.schema";
import { getOrderByIdSchema } from "./get-order-by-id.schema";
import { createOrderSchema } from "./create-order.schema";
import { updateOrderSchema } from "./update-order.schema";
import { getMyOrganizationOrdersSchema } from "./get-my-organization-orders.schema";
import { deleteOrderSchema } from "./delete-order.schema";
import { updateOrderStatusSchema } from "./update-order-status.schema";
import { updatePaymentStatusSchema } from "./update-payment-status.schema";
import { getOrderHistorySchema } from "./get-order-history.schema";

export type getAllOrdersInput = z.infer<typeof getAllOrdersSchema>;
export type getOrderByIdInput = z.infer<typeof getOrderByIdSchema>;
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

export type OrdersInfo = {
  id: string;
  deliveryDate: Date;
  orderStatus:
    | "new"
    | "published"
    | "accepted"
    | "in_progress"
    | "completed"
    | "cancelled";
  paymentStatus: "unpaid" | "paid" | "verified";
  totalPrice: number;
  school: {
    id: string;
    name: string;
  } | null;
  supplier: {
    id: string;
    name: string;
  } | null;
};

export type OrdersStats = {
  recent: OrdersInfo[];
  upcoming: OrdersInfo[];
  stats: {
    ordersCount: number;
    nextDelivery: {
      deliveryDate: Date | null;
      comment: string | null;
    };
    unpaidAmount: number;
  };
};
