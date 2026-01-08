import { z } from "zod";

export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});
