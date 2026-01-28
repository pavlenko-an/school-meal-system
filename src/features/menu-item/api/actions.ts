"use server";

import { MenuItem } from "@/generated/prisma/client";
import { getCurrentUser } from "@/shared/auth/current-user";
import { ActionResult } from "@/shared/types/action-result";
import {
  createMenuItemSchema,
  deleteMenuItemSchema,
  updateMenuItemSchema,
} from "../model/schemas";
import { MenuItemService } from "../model/services";
import {
  createMenuItemInput,
  deleteMenuItemInput,
  updateMenuItemInput,
} from "../model/types";
import z from "zod";

export async function createMenuItem(
  prevState: ActionResult<MenuItem> | null = null,
  formData: FormData | createMenuItemInput,
): Promise<ActionResult<MenuItem>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть створювати позиції",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = createMenuItemSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const menuItem = await MenuItemService.create(result.data);
    return { success: true, data: menuItem };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Не вдалося створити позицію",
    };
  }
}

export async function updateMenuItem(
  prevState: ActionResult<MenuItem> | null = null,
  formData: FormData | updateMenuItemInput,
): Promise<ActionResult<MenuItem>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть оновлювати позиції меню",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = updateMenuItemSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const updatedMenuItem = await MenuItemService.update(result.data);
    return {
      success: true,
      data: updatedMenuItem,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося оновити позицію меню",
    };
  }
}

export async function deleteMenuItem(
  prevState: ActionResult<void> | null = null,
  formData: FormData | deleteMenuItemInput,
): Promise<ActionResult<void>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть видаляти позиції меню",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = deleteMenuItemSchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    await MenuItemService.delete(result.data);
    return {
      success: true,
      message: "Позиція меню успішно видалена",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити позицію меню",
    };
  }
}
