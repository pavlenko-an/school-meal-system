import { z } from "zod";

export const getUserByIdSchema = z.object({
  id: z.uuid("Invalid user ID"),
});
