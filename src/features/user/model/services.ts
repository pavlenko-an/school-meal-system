import { prisma } from "@/shared/db/prisma";
import bcrypt from "bcryptjs";
import { deleteUserInput, updateUserInput } from "./types";

export const UserService = {
  async update(data: updateUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: data.id },
    });
    if (!user) {
      throw new Error("Користувача не знайдено");
    }

    const updateData: Record<string, unknown> = {};
    if (data.email !== undefined) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== data.id) {
        throw new Error("Email вже використовується");
      }
      updateData.email = data.email;
    }
    if (data.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;

    return await prisma.user.update({
      where: { id: data.id },
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
  },

  async delete(data: deleteUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: data.id },
    });
    if (!user) {
      throw new Error("Користувача не знайдено");
    }
    await prisma.user.delete({
      where: { id: data.id },
    });
  },
};
