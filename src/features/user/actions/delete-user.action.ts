"use server";

import { prisma } from "@/shared/db/prisma";
import { getCurrentUser } from "@/shared/auth/current-user";

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteUser(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false,
        error: "Сесія не активна. Увійдіть повторно",
      };
    }

    let targetUserId: string;

    const rawId = formData.get("id");
    if (rawId && typeof rawId === "string" && rawId.trim()) {
      if (currentUser.role !== "admin") {
        return {
          success: false,
          error:
            "Тільки адміністратор може видаляти профіль іншого користувача",
        };
      }
      targetUserId = rawId.trim();
    } else {
      targetUserId = currentUser.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return {
        success: false,
        error: "Користувача не знайдено",
      };
    }

    if (user.role === "admin" && currentUser.id !== targetUserId) {
      return {
        success: false,
        error: "Не можна видаляти іншого адміністратора",
      };
    }

    await prisma.user.delete({
      where: { id: targetUserId },
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
