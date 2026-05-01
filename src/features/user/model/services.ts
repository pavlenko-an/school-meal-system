import { prisma } from "@/shared/db/prisma";
import bcrypt from "bcryptjs";
import { deleteUserInput, updateUserInput } from "./types";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

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
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: data.id },
        },
      });
      if (existingUser) {
        throw new Error("Email вже використовується");
      }
      updateData.email = data.email;
    }
    if (data.password !== undefined && data.password.length > 0) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.avatar !== undefined) {
      let avatarUrl: string | null = null;
      if (data.avatar && data.avatar.size > 0) {
        const file = data.avatar;
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${randomUUID()}.${fileExt}`;
        const filePath = path.join(
          process.cwd(),
          "public/uploads/avatars",
          fileName,
        );

        const buffer = Buffer.from(await file.arrayBuffer());
        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, buffer);
        avatarUrl = `/uploads/avatars/${fileName}`;
      }
      updateData.avatarUrl = avatarUrl;
    }

    return await prisma.user.update({
      where: { id: data.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
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
