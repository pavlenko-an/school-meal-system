import { z } from "zod";

export const getMenuItemByIdSchema = z.object({
  id: z.string().uuid(),
});
