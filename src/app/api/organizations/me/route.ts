import { authOptions } from "@/features/auth";
import { getCurrentOrganization } from "@/features/organization/lib/organization";
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
    const organization = await getCurrentOrganization(currentUser);
    const response: ApiResponse<typeof organization> = { data: organization };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
