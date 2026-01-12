import { z } from "zod";

export const createMenuImageSchema = z.object({
  menuItemId: z.uuid("Invalid menu item ID"),
  imageUrl: z.string().min(1, "Image URL cannot be empty"),
  isPrimary: z.boolean().default(false),
});
