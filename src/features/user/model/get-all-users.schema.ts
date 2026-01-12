import { z } from "zod";

export const getAllUsersSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  organizationId: z.uuid("Invalid organization ID").optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .optional(),
  offset: z.coerce
    .number()
    .int()
    .min(0, "Offset must be at least 0")
    .optional(),
});
