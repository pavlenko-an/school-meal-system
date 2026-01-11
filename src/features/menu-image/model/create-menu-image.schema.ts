import { z } from "zod";

export const createMenuImageSchema = z.object({
  menuItemId: z.string().uuid(),
  imageUrl: z.string().min(1, "Image URL cannot be empty"),
  isPrimary: z.boolean().default(false),
});
