"use server";

import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteUser(
  prevState: ActionResult | null = null,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser.role !== "employee") {
      return {
        success: false,
        error: "Лишe працівники можуть видаляти свої профілі",
      };
    }
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });
    if (!user) {
      return { success: false, error: "Користувача не знайдено" };
    }
    await prisma.user.delete({
      where: { id: currentUser.id },
    });
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
