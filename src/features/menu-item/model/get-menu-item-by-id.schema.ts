import { z } from "zod";

export const getMenuItemByIdSchema = z.object({
  id: z.uuid("Invalid menu item ID"),
});
