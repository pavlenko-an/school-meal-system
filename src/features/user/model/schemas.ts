import { z } from "zod";

export const getAllUsersSchema = z.object({
  name: z.string().trim().optional(),
  organizationId: z.uuid("Неправильний формат ID організації").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getUserByIdSchema = z.object({
  id: z.uuid("Неправильний формат ID користувача"),
});

export const updateUserSchema = z.object({
  id: z.uuid("Неправильний формат ID користувача").optional(),
  email: z
    .email("Неправильний формат електронної пошти")
    .transform((v) => v.trim().toLowerCase())
    .optional()
    .refine((v) => v !== "", {
      message: "Електронна пошта не може бути порожньою",
    }),
  password: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length === 0 || val.length >= 8, {
      message: "Пароль повинен бути щонайменше 8 символів",
    })
    .refine(
      (val) =>
        val === undefined ||
        val.length === 0 ||
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      {
        message: "Пароль повинен містити великі та малі літери та цифру",
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
  avatar: z.instanceof(File).optional(),
  organizationId: z
    .uuid("Неправильний формат ID організації")
    .optional()
    .nullable(),
});

export const deleteUserSchema = z.object({
  id: z.uuid("Неправильний формат ID користувача"),
});
