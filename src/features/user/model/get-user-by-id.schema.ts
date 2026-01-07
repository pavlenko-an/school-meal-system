import { z } from "zod";

export const getUserByIdSchema = z.object({
  id: z.string().uuid(),
});
