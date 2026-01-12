import { authOptions } from "@/features/auth/lib/auth";
import { getAllUsers } from "@/features/user/lib/user";
import { getAllUsersSchema } from "@/features/user/model/get-all-users.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { CurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser: CurrentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
      organizationType: session.user.organizationType,
    };

    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllUsersSchema.parse(query);
    const users = await getAllUsers(parsedQuery, currentUser);
    return NextResponse.json(users);
  } catch (e) {
    return handleApiError(e);
  }
}
