import { authOptions } from "@/features/auth/lib/auth";
import { getAllUsers } from "@/features/user/lib/user";
import { getAllUsersSchema } from "@/features/user/model/get-all-users.schema";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllUsersSchema.parse(query);
    const users = await getAllUsers(parsedQuery, currentUser);
    const response: ApiResponse<typeof users> = { data: users };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
