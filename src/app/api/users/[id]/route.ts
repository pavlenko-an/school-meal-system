import { authOptions } from "@/features/auth/lib/auth";
import { deleteUser, getUserById, updateUser } from "@/features/user/lib/user";
import { deleteUserSchema } from "@/features/user/model/delete-user.schema";
import { getUserByIdSchema } from "@/features/user/model/get-user-by-id.schema";
import { updateUserSchema } from "@/features/user/model/update-user.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const parsedParams = getUserByIdSchema.parse({ id });
    const user = await getUserById(parsedParams, currentUser);
    return NextResponse.json(user);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const parsedData = updateUserSchema.parse({ ...body, id });
    const user = await updateUser(parsedData, currentUser);
    return NextResponse.json(user);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const parsedParams = deleteUserSchema.parse({ id });
    await deleteUser(parsedParams, currentUser);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
