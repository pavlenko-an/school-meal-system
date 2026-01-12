import { z } from "zod";

export const getAllOrganizationsSchema = z.object({
  name: z.string().trim().optional(),
  type: z
    .enum(["school", "supplier"], "Type must be either 'school' or 'supplier'")
    .optional(),
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
