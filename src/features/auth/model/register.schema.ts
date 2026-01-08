import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase letters and a number"
    ),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  organizationId: z.string().uuid(),
});
