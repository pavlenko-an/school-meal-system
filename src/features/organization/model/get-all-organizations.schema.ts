import { z } from "zod";

export const getAllOrganizationsSchema = z.object({
  name: z.string().trim().optional(),
  type: z
    .enum(["school", "supplier"], "Type must be either 'school' or 'supplier'")
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
