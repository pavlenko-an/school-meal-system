"use server";

import { prisma } from "@/shared/db/prisma";
import bcrypt from "bcryptjs";
import { updateUserInput, UserInfo } from "../model/user.types";
import { getCurrentUser } from "@/shared/auth/current-user";
import { updateUserSchema } from "../model/update-user.schema";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { success: true; user: UserInfo }
  | { success: false; error: string };

export async function updateUser(
  prevState: ActionResult | null = null,
  formData: FormData | updateUserInput,
): Promise<ActionResult> {
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
    const data = updateUserSchema.parse(rawData);
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });
    if (!user) {
      return { success: false, error: "Користувача не знайдено" };
    }

    const updateData: Record<string, unknown> = {};
    if (data.email !== undefined) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== currentUser.id) {
        return {
          success: false,
          error: "Email вже використовується",
        };
      }
      updateData.email = data.email;
    }
    if (data.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
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

    revalidatePath(`/profile`);
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
