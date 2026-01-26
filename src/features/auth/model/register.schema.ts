import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .email("Invalid email format")
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase letters and a number",
      ),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    organizationId: z.uuid("Invalid organization ID"),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if ("confirmPassword" in data && data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );
