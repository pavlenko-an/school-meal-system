import { prisma } from "@/shared/db/prisma";
import bcrypt from "bcryptjs";
import { RegisterInput } from "../model/auth.types";
import { ConflictError } from "@/shared/errors/conflict.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

export async function registerUser(data: RegisterInput) {
  const [existingUser, organization] = await Promise.all([
    prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    }),
    prisma.organization.findUnique({
      where: { id: data.organizationId },
    }),
  ]);

  if (existingUser)
    throw new ConflictError("User with this email already exists");
  if (!organization) throw new NotFoundError("Organization not found");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: "employee",
      organizationId: organization.id,
    },
  });

  return user;
}
