import { z } from "zod";

export const deleteCategorySchema = z.object({
  id: z.uuid("Invalid category ID"),
});
