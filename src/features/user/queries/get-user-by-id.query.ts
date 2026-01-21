import { prisma } from "@/shared/db/prisma";
import { CurrentUser } from "@/shared/auth/current-user";
import { getUserByIdInput } from "../model/user.types";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { NotFoundError } from "@/shared/errors/not-found.error";

export async function getUserById(
  data: getUserByIdInput,
  currentUser: CurrentUser,
) {
  if (currentUser.role !== "admin" && currentUser.id !== data.id) {
    throw new AccessDeniedError("Access denied");
  }
  const user = await prisma.user.findUnique({
    where: { id: data.id },
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
