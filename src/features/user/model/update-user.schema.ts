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
    .optional()
    .refine((val) => val === undefined || val.length === 0 || val.length >= 8, {
      message: "Password must be at least 8 characters long",
    })
    .refine(
      (val) =>
        val === undefined ||
        val.length === 0 ||
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      {
        message:
          "Password must contain uppercase, lowercase letters and a number",
      }
    ),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  role: z
    .enum(["employee", "admin"], "Role must be either 'employee' or 'admin'")
    .optional(),
});

export const updateUserFormSchema = updateUserSchema.omit({
  id: true,
  organizationId: true,
  role: true,
});
