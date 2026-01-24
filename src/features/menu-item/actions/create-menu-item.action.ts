"use server";

import { prisma } from "@/shared/db/prisma";
import { MenuItem } from "@/generated/prisma/client";
import { createMenuItemInput } from "../model/menu-item.types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { createMenuItemSchema } from "../model/create-menu-item.schema";

type ActionResult =
  | { success: true; data: MenuItem }
  | { success: false; error: string };

export async function createMenuItem(
  prevState: ActionResult | null = null,
  formData: FormData | createMenuItemInput,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    const rawData =
      formData instanceof FormData ? Object.fromEntries(formData) : formData;
    const data = createMenuItemSchema.parse(rawData);
    if (currentUser.role !== "admin") {
      return {
        success: false,
        error: "Лише адміністратори можуть створювати позиції меню",
      };
    }
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { name: data.name },
    });
    if (existingMenuItem) {
      return {
        success: false,
        error: "Позиція меню з такою назвою вже існує",
      };
    }
    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        categoryId: data.categoryId,
        isAvailable: data.isAvailable ?? true,
      },
    });
    return {
      success: true,
      data: menuItem,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося створити позицію меню",
    };
  }
}
