import { z } from "zod";

export const deleteOrganizationSchema = z.object({
  id: z.uuid("Invalid organization ID"),
});
