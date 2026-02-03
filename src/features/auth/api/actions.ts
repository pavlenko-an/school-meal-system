"use server";

import z from "zod";
import { registerSchema } from "../model/schemas";
import { ActionResult } from "@/shared/types/action-result";
import { RegisterInput } from "../model/types";
import { AuthService } from "../model/services";

export async function registerUser(
  prevState: ActionResult<void> | null = null,
  formData: FormData | RegisterInput,
): Promise<ActionResult<void>> {
  try {
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = registerSchema.safeParse(rawData);
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
