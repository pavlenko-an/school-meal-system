import { z } from "zod";

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .refine((v) => v !== "", { message: "Email cannot be empty" }),
  password: z
    .string()
    .min(8)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional()
    .refine((v) => v !== "", { message: "Password cannot be empty" }),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  role: z.enum(["employee", "admin"]).optional(),
});
