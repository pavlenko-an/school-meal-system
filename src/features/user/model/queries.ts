import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { CurrentUser } from "@/shared/auth/current-user";
import { getAllUsersInput, getUserByIdInput, UserInfo } from "../model/types";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { getAllUsersSchema, getUserByIdSchema } from "./schemas";

export async function getAllUsers(
  data: getAllUsersInput,
  currentUser: CurrentUser,
): Promise<UserInfo[]> {
  const validated = getAllUsersSchema.parse(data);
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const existingOrg = validated.organizationId
    ? await prisma.organization.findUnique({
        where: { id: validated.organizationId },
      })
    : null;
  if (validated.organizationId && !existingOrg) {
    throw new NotFoundError("Organization not found");
  }

  const filters: Prisma.UserWhereInput[] = [];
  if (validated.organizationId) {
    filters.push({ organizationId: validated.organizationId });
  }
  if (validated.firstName) {
    filters.push({
      firstName: { contains: validated.firstName, mode: "insensitive" },
    });
  }
  if (validated.lastName) {
    filters.push({
      lastName: { contains: validated.lastName, mode: "insensitive" },
    });
  }

  const users = await prisma.user.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    take: validated.limit ?? 20,
    skip: validated.offset ?? 0,
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
  return users;
}

export async function getUserById(
  data: getUserByIdInput,
  currentUser: CurrentUser,
): Promise<UserInfo> {
  const validated = getUserByIdSchema.parse(data);
  if (currentUser.role !== "admin" && currentUser.id !== validated.id) {
    throw new AccessDeniedError("Access denied");
  }
  const user = await prisma.user.findUnique({
    where: { id: validated.id },
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
  if (!user) throw new NotFoundError("User not found");
  return user;
}
