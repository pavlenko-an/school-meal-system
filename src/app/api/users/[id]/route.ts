import { authOptions } from "@/features/auth/lib/auth";
import { deleteUser, getUserById, updateUser } from "@/features/user/lib/user";
import { handleApiError } from "@/shared/api/handle-api-error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
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
    if (session.user.role !== "admin" && session.user.id !== id) {
      throw new AccessDeniedError("Access denied");
    }

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const user = await getUserById({ id }, currentUser);
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
    const user = await updateUser({ ...body, id }, currentUser);
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

    await deleteUser({ id }, currentUser);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
