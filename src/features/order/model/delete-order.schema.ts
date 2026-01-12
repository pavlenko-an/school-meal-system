import { z } from "zod";

export const deleteOrderSchema = z.object({
  id: z.uuid("Invalid order ID"),
});
