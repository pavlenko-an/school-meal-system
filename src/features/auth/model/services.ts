import { prisma } from "@/shared/db/prisma";
import bcrypt from "bcryptjs";
import { RegisterInput } from "./types";
import { ConflictError } from "@/shared/errors/conflict.error";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

export const AuthService = {
  async register(data: RegisterInput) {
    const [existingUser, organization] = await Promise.all([
      prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      }),
      prisma.organization.findUnique({
        where: { id: data.organizationId },
      }),
    ]);

    if (existingUser)
      throw new ConflictError("Користувач з таким email вже існує");
    if (!organization) throw new NotFoundError("Організація не знайдена");

    const passwordHash = await bcrypt.hash(data.password, 10);

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

    await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        role: "employee",
        avatarUrl,
        organizationId: organization.id,
      },
    });
  },
};
