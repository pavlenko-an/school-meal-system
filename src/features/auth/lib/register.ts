import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "../model/register.schema";

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) throw new Error("User with this email already exists");

  const passwordHash = await bcrypt.hash(data.password, 10);

  const defaultOrganizationId = "00000000-0000-0000-0000-000000000000";

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: "employee",
      organizationId: defaultOrganizationId,
    },
  });

  return user;
}
