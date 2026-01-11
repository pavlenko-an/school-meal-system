import { z } from "zod";

export const getOrderByIdSchema = z.object({
  id: z.string().uuid(),
});
