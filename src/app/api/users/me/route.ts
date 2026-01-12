import { authOptions } from "@/features/auth/lib/auth";
import { getCurrentUser } from "@/features/user/lib/user";
import { handleApiError } from "@/shared/api/handle-api-error";
import { CurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser: CurrentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
      organizationType: session.user.organizationType,
    };
    const user = await getCurrentUser(currentUser);
    return NextResponse.json(user);
  } catch (e) {
    return handleApiError(e);
  }
}
