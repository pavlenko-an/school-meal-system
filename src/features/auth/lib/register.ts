import { prisma } from "@/shared/db/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "../model/register.schema";
import { RegisterInput } from "../model/auth.types";

export async function registerUser(input: RegisterInput) {
  const data = registerSchema.parse(input);
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existingUser) throw new Error("User with this email already exists");

  const organization = await prisma.organization.findUnique({
    where: { id: data.organizationId },
  });
  if (!organization) throw new Error("Organization not found");

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
