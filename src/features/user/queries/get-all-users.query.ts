import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { CurrentUser } from "@/shared/auth/current-user";
import { getAllUsersInput } from "../model/user.types";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

export async function getAllUsers(
  data: getAllUsersInput,
  currentUser: CurrentUser,
) {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const existingOrg = data.organizationId
    ? await prisma.organization.findUnique({
        where: { id: data.organizationId },
      })
    : null;
  if (data.organizationId && !existingOrg) {
    throw new NotFoundError("Organization not found");
  }

  const filters: Prisma.UserWhereInput[] = [];
  if (data.organizationId) {
    filters.push({ organizationId: data.organizationId });
  }
  if (data.firstName) {
    filters.push({
      firstName: { contains: data.firstName, mode: "insensitive" },
    });
  }
  if (data.lastName) {
    filters.push({
      lastName: { contains: data.lastName, mode: "insensitive" },
    });
  }

  const users = await prisma.user.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return users;
}
