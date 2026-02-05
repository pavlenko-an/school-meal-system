import { prisma } from "@/shared/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { CurrentUser } from "@/shared/auth/current-user";
import {
  getAllUsersInput,
  getUserByIdInput,
  UserInfo,
  UsersList,
} from "../model/types";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { getAllUsersSchema, getUserByIdSchema } from "./schemas";
import { notFound } from "next/navigation";

export async function getAllUsers(
  data: getAllUsersInput,
  currentUser: CurrentUser,
): Promise<UsersList> {
  if (currentUser.role !== "admin") {
    throw new AccessDeniedError("Access denied");
  }
  const validated = getAllUsersSchema.parse(data);
  const page = validated.page && validated.page > 0 ? validated.page : 1;
  const limit = validated.limit && validated.limit > 0 ? validated.limit : 10;
  const skip = (page - 1) * limit;
  const existingOrg = validated.organizationId
    ? await prisma.organization.findUnique({
        where: { id: validated.organizationId },
      })
    : null;
  if (validated.organizationId && !existingOrg) {
    notFound();
  }

  const filters: Prisma.UserWhereInput[] = [];
  if (validated.organizationId) {
    filters.push({ organizationId: validated.organizationId });
  }
  if (validated.name) {
    filters.push({
      OR: [
        {
          firstName: {
            contains: validated.name,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: validated.name,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: filters.length > 0 ? { AND: filters } : undefined,
      skip: skip,
      take: limit,
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
    }),
    prisma.user.count({
      where: filters.length > 0 ? { AND: filters } : undefined,
    }),
  ]);
  const totalPages = Math.ceil(total / limit);
  return { users, total, page, totalPages };
}

export async function getAllUsersStats() {
  const [total, admins, employees, withOrg, withoutOrg] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { role: "employee" } }),
    prisma.user.count({ where: { organizationId: { not: null } } }),
    prisma.user.count({ where: { organizationId: null } }),
  ]);

  return {
    total,
    admins,
    employees,
    withOrg,
    withoutOrg,
    adminsPercentage: total > 0 ? Math.round((admins / total) * 100) : 0,
    employeesPercentage: total > 0 ? Math.round((employees / total) * 100) : 0,
  };
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
  if (!user) notFound();
  return user;
}
