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

export const getUserByIdSchema = z.object({
  id: z.uuid("Invalid user ID"),
});

export const updateUserSchema = z.object({
  id: z.uuid("Invalid user ID").optional(),
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
      },
    ),
  firstName: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  lastName: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const deleteUserSchema = z.object({
  id: z.uuid("Invalid user ID"),
});
