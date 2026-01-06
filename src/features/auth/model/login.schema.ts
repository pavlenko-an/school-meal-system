import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
