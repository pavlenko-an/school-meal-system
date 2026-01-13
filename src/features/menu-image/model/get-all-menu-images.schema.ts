import { z } from "zod";

export const getAllMenuImagesSchema = z.object({
  menuItemId: z.uuid("Invalid menu item ID"),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
