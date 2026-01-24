"use server";

import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";
import { deleteMenuItemSchema } from "../model/delete-menu-item.schema";
import { deleteMenuItemInput } from "../model/menu-item.types";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteMenuItem(
  prevState: ActionResult | null = null,
  formData: FormData | deleteMenuItemInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = deleteMenuItemSchema.parse(rawData);
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть видаляти позиції меню",
      };
    }
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: data.id },
    });
    if (!menuItem) {
      return {
        success: false,
        error: "Позиція меню не знайдена",
      };
    }
    await prisma.menuItem.delete({
      where: { id: data.id },
    });
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
