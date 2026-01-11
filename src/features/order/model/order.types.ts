import { z } from "zod";
import { getAllOrdersSchema } from "./get-all-orders.schema";
import { getOrderByIdSchema } from "./get-order-by-id.schema";
import { createOrderSchema } from "./create-order.schema";
import { updateOrderSchema } from "./update-order.schema";
import { getCurrentOrganizationOrdersSchema } from "./get-current-organization-orders.schema";

export type getAllOrdersInput = z.infer<typeof getAllOrdersSchema>;
export type getOrderByIdInput = z.infer<typeof getOrderByIdSchema>;
export type getCurrentOrganizationOrdersInput = z.infer<
  typeof getCurrentOrganizationOrdersSchema
>;
export type createOrderInput = z.infer<typeof createOrderSchema>;
export type updateOrderInput = z.infer<typeof updateOrderSchema>;
