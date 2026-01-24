"use server";

import { prisma } from "@/shared/db/prisma";
import { MenuItem } from "@/generated/prisma/client";
import { updateMenuItemInput } from "../model/menu-item.types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { updateMenuItemSchema } from "../model/update-menu-item.schema";

type ActionResult =
  | { success: true; data: MenuItem }
  | { success: false; error: string };

export async function updateMenuItem(
  prevState: ActionResult | null = null,
  formData: FormData | updateMenuItemInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = updateMenuItemSchema.parse(rawData);
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть оновлювати позиції меню",
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

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      const existingMenuItem = await prisma.menuItem.findUnique({
        where: { name: data.name },
      });
      if (existingMenuItem && existingMenuItem.id !== data.id) {
        return {
          success: false,
          error: "Позиція меню з такою назвою вже існує",
        };
      }
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    if (data.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return {
          success: false,
          error: "Категорія не знайдена",
        };
      }
      updateData.categoryId = data.categoryId;
    }
    if (data.isAvailable !== undefined) {
      updateData.isAvailable = data.isAvailable;
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: data.id },
      data: updateData,
    });
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
