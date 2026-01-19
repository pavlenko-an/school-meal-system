import { authOptions } from "@/features/auth/lib/auth";
import {
  deleteUser,
  updateUser,
} from "@/features/user/lib/user";
import { deleteUserSchema } from "@/features/user/model/delete-user.schema";
import { updateUserSchema } from "@/features/user/model/update-user.schema";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const body = await req.json();
    const parsedData = updateUserSchema.parse({ id: currentUser.id, ...body });
    const user = await updateUser(parsedData, currentUser);
    const response: ApiResponse<typeof user> = { data: user };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const parsedParams = deleteUserSchema.parse({ id: currentUser.id });
    await deleteUser(parsedParams, currentUser);
    const response: ApiResponse<{ message: string }> = {
      data: { message: "User deleted successfully" },
    };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
