import { z } from "zod";

export const getMenuImageByIdSchema = z.object({
  id: z.uuid("Invalid menu image ID").optional(),
});
