import { z } from "zod";

export const getOrderHistorySchema = z.object({
  id: z.uuid("Invalid order ID"),
});
