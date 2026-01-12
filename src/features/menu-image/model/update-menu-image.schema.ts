import { z } from "zod";

export const updateMenuImageSchema = z.object({
  id: z.uuid("Invalid menu image ID"),
  imageUrl: z.string().optional(),
  isPrimary: z.boolean().optional(),
});
