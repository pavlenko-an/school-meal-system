import { z } from "zod";

export const deleteMenuImageSchema = z.object({
  id: z.string().uuid(),
});
