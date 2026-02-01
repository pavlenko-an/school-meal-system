"use server";

import { ActionResult } from "@/shared/types/action-result";
import {
  CategoryInfo,
  createCategoryInput,
  deleteCategoryInput,
  updateCategoryInput,
} from "../model/types";
import { getCurrentUser } from "@/shared/auth/current-user";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "../model/schemas";
import z from "zod";
import { CategoryService } from "../model/services";

export async function createCategory(
  prevState: ActionResult<CategoryInfo> | null = null,
  formData: FormData | createCategoryInput,
): Promise<ActionResult<CategoryInfo>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть створювати категорії",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = createCategorySchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const category = await CategoryService.create(result.data);
    return { success: true, data: category };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити категорію",
    };
  }
}

export async function updateCategory(
  prevState: ActionResult<CategoryInfo> | null = null,
  formData: FormData | updateCategoryInput,
): Promise<ActionResult<CategoryInfo>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть оновлювати категорії",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = updateCategorySchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    const updatedCategory = await CategoryService.update(result.data);
    return {
      success: true,
      data: updatedCategory,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Не вдалося оновити категорію",
    };
  }
}

export async function deleteCategory(
  prevState: ActionResult<void> | null = null,
  formData: FormData | deleteCategoryInput,
): Promise<ActionResult<void>> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть видаляти категорії",
      };
    }
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const result = deleteCategorySchema.safeParse(rawData);
    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        success: false,
        error: "Перевірте дані",
        fieldErrors: flattened.fieldErrors,
      };
    }
    await CategoryService.delete(result.data);
    return {
      success: true,
      message: "Категорія успішно видалена",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося видалити категорію",
    };
  }
}
