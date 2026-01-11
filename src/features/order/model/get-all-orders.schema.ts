import { z } from "zod";

export const getAllOrdersSchema = z.object({
  organizationId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z
    .enum(["new", "paid", "in_progress", "completed", "cancelled"])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
