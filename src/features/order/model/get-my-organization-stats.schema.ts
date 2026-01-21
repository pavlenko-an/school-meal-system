import { z } from "zod";

export const getMyOrganizationStatsSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
