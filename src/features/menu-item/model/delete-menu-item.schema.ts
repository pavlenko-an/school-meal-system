import { z } from "zod";

export const deleteMenuItemSchema = z.object({
  id: z.uuid("Invalid menu item ID"),
});
