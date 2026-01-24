import { prisma } from "@/shared/db/prisma";
import { CurrentUser } from "@/shared/auth/current-user";
import { getUserByIdInput, UserInfo } from "../model/user.types";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { NotFoundError } from "@/shared/errors/not-found.error";
import { getUserByIdSchema } from "../model/get-user-by-id.schema";

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
