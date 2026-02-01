"use server";

import { ActionResult } from "@/shared/types/action-result";
import { deleteUserInput, updateUserInput, UserInfo } from "../model/types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { updateUserSchema } from "../model/schemas";
import { UserService } from "../model/services";
import z from "zod";

export async function updateUser(
  prevState: ActionResult<UserInfo> | null = null,
  formData: FormData | updateUserInput,
): Promise<ActionResult<UserInfo>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть оновлювати свої дані",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = updateUserSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const updatedUser = await UserService.update({
      ...result.data,
      id: currentUser.id,
    });
    return { success: true, data: updatedUser };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити користувача",
    };
  }
}

export async function deleteUser(
  prevState: ActionResult<void> | null = null,
  data?: deleteUserInput,
): Promise<ActionResult<void>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }
    const targetUserId =
      currentUser.role === "admin" && data?.id ? data.id : currentUser.id;
    if (currentUser.role !== "admin" && data?.id && data.id !== currentUser.id) {
      return {
        success: false,
        error: "Ви не маєте прав видаляти інших користувачів",
      };
    }
    await UserService.delete({ id: targetUserId });
    return {
      success: true,
      message: "Користувача успішно видалено",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити користувача",
    };
  }
}
