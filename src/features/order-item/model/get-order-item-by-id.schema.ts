import { z } from "zod";

export const getOrderItemByIdSchema = z.object({
  id: z.string().uuid(),
});
