"use server";

import { prisma } from "@/shared/db/prisma";
import bcrypt from "bcryptjs";
import { updateUserInput, UserInfo } from "../model/user.types";
import { getCurrentUser } from "@/shared/auth/current-user";

type ActionResult =
  | { success: true; user: UserInfo }
  | { success: false; error: string };

export async function updateUser(
  prevState: ActionResult | null,
  formData: FormData | updateUserInput,
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

    if (typeof formData === "object" && "id" in formData && formData.id) {
      if (currentUser.role !== "admin") {
        return {
          success: false,
          error:
            "Тільки адміністратор може змінювати профіль іншого користувача",
        };
      }
      targetUserId = formData.id;
    } else {
      targetUserId = currentUser.id;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Користувача не знайдено",
      };
    }

    if (targetUser.role === "admin" && currentUser.id !== targetUserId) {
      return {
        success: false,
        error: "Не можна змінювати іншого адміністратора",
      };
    }

    const updateData: Record<string, unknown> = {};

    const data =
      formData instanceof FormData
        ? (Object.fromEntries(formData) as Partial<updateUserInput>)
        : formData;

    if (data.email !== undefined) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== targetUserId) {
        return {
          success: false,
          error: "Email вже використовується",
        };
      }
      updateData.email = data.email;
    }

    if (data.password !== undefined && data.password !== "") {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.organizationId !== undefined) {
      if (currentUser.role !== "admin") {
        return {
          success: false,
          error: "Доступ заборонено",
        };
      }
      updateData.organizationId = data.organizationId;
    }

    if (data.role !== undefined) {
      if (currentUser.role !== "admin") {
        return {
          success: false,
          error: "Доступ заборонено",
        };
      }
      updateData.role = data.role;
    }

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
      },
    });

    return { success: true, user: updatedUser };
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
