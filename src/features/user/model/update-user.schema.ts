import { z } from "zod";

export const updateUserSchema = z.object({
  id: z.uuid("Invalid user ID"),
  organizationId: z.uuid("Invalid organization ID").optional(),
  email: z
    .email("Invalid email format")
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .refine((v) => v !== "", { message: "Email cannot be empty" }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase letters and a number"
    )
    .optional()
    .refine((v) => v !== "", { message: "Password cannot be empty" }),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  role: z
    .enum(["employee", "admin"], "Role must be either 'employee' or 'admin'")
    .optional(),
});
