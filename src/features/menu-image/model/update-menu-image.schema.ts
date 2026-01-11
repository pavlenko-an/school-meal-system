import { z } from "zod";

export const updateMenuImageSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().optional(),
  isPrimary: z.boolean().optional(),
});
