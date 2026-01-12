import { z } from "zod";

export const deleteMenuImageSchema = z.object({
  id: z.uuid("Invalid menu image ID"),
});
