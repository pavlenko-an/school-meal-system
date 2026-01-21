import { getCurrentOrganization } from "@/features/organization";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
    const organization = await getCurrentOrganization(currentUser);
    const response: ApiResponse<typeof organization> = { data: organization };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
