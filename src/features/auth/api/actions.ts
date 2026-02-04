"use server";

import z from "zod";
import { registerSchema } from "../model/schemas";
import { ActionResult } from "@/shared/types/action-result";
import { AuthService } from "../model/services";

export async function registerUser(
  prevState: ActionResult<void> | null = null,
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    const avatarFile = formData.get("avatar");
    let avatar: File | undefined;
    if (avatarFile instanceof File && avatarFile.size > 0) {
      avatar = avatarFile;
    }
    const rawData = Object.fromEntries(formData);
    const result = registerSchema.safeParse({ ...rawData, avatar });
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    await AuthService.register(result.data);
    return {
      success: true,
      message: "Користувача успішно зареєстровано",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося зареєструвати користувача",
    };
  }
}
