import { z } from "zod";

export const deleteMenuItemSchema = z.object({
  id: z.string().uuid(),
});
