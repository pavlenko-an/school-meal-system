import { z } from "zod";

export const getOrganizationByIdSchema = z.object({
  id: z.string().uuid(),
});
