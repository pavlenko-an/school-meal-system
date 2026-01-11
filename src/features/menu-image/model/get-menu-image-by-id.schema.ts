import { z } from "zod";

export const getMenuImageByIdSchema = z.object({
  id: z.string().uuid().optional(),
});
