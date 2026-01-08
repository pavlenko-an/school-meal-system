import { z } from "zod";

export const getCategoryByIdSchema = z.object({
  id: z.string().uuid(),
});
