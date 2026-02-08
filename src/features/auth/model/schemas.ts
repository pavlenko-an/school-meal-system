import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .email("Неправильний формат електронної адреси")
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "Пароль повинен містити щонайменше 8 символів")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Пароль повинен містити великі та малі літери та цифру",
      ),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    organizationId: z.uuid("Неправильний формат ID організації"),
    confirmPassword: z.string().optional(),
    avatar: z.instanceof(File).optional(),
  })
  .refine(
    (data) => {
      if ("confirmPassword" in data && data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Паролі не співпадають",
      path: ["confirmPassword"],
    },
  );

export const loginSchema = z.object({
  email: z
    .email("Неправильний формат електронної адреси")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Пароль повинен містити щонайменше 8 символів")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль повинен містити великі та малі літери та цифру",
    ),
});
