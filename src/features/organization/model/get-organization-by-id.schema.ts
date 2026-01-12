import { z } from "zod";

export const getOrganizationByIdSchema = z.object({
  id: z.uuid("Invalid organization ID"),
});
