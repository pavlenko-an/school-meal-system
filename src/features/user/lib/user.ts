import { prisma } from "@/shared/db/prisma";
import {
  deleteUserInput,
  getAllUsersInput,
  getUserByIdInput,
  updateUserInput,
} from "../model/user.types";
import bcrypt from "bcryptjs";
import { CurrentUser } from "@/shared/auth/current-user";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { ConflictError } from "@/shared/errors/conflict.error";

export async function getAllUsers(
  data: getAllUsersInput,
  currentUser: CurrentUser
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
  const users = await prisma.user.findMany({
    where: {
      AND: [
        data.organizationId
          ? { organizationId: data.organizationId }
          : undefined,
        data.firstName
          ? { firstName: { contains: data.firstName, mode: "insensitive" } }
          : undefined,
        data.lastName
          ? { lastName: { contains: data.lastName, mode: "insensitive" } }
          : undefined,
      ].filter(Boolean) as any[],
    },
    take: data.limit ?? 20,
    skip: data.offset ?? 0,
  });
  return users;
}

export async function getCurrentUser(currentUser: CurrentUser) {
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
}

export async function getUserById(
  data: getUserByIdInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin" && currentUser.id !== data.id) {
    throw new AccessDeniedError("Access denied");
  }
  const user = await prisma.user.findUnique({
    where: { id: data.id },
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
}

export async function updateUser(
  data: updateUserInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin" && currentUser.id !== data.id) {
    throw new AccessDeniedError("Access denied");
  }
  const user = await prisma.user.findUnique({
    where: { id: data.id },
  });
  if (!user) throw new NotFoundError("User not found");
  if (user.role === "admin" && currentUser.id !== user.id) {
    throw new AccessDeniedError("Cannot modify another admin");
  }

  const updateData: Record<string, unknown> = {};
  if (data.email !== undefined) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser && existingUser.id !== data.id) {
      throw new ConflictError("Email already in use");
    }
    updateData.email = data.email;
  }
  if (data.password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }
  if (data.organizationId !== undefined) {
    if (currentUser.role !== "admin") {
      throw new AccessDeniedError("Access denied");
    }
    updateData.organizationId = data.organizationId;
  }
  if (data.role !== undefined) {
    if (currentUser.role !== "admin") {
      throw new AccessDeniedError("Access denied");
    }
    updateData.role = data.role;
  }
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;

  const updatedUser = await prisma.user.update({
    where: { id: data.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

export async function deleteUser(
  data: deleteUserInput,
  currentUser: CurrentUser
) {
  if (currentUser.role !== "admin" && currentUser.id !== data.id) {
    throw new AccessDeniedError("Access denied");
  }
  const user = await prisma.user.findUnique({
    where: { id: data.id },
  });
  if (!user) throw new NotFoundError("User not found");
  await prisma.user.delete({
    where: { id: data.id },
  });
}
