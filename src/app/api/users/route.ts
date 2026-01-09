import { authOptions } from "@/features/auth/lib/auth";
import { getAllUsers } from "@/features/user/lib/user";
import { handleApiError } from "@/shared/api/handle-api-error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    if (session.user.role !== "admin") {
      throw new AccessDeniedError("Access denied");
    }

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const users = await getAllUsers({ ...query }, currentUser);
    return NextResponse.json(users);
  } catch (e) {
    return handleApiError(e);
  }
}
