import { getOrderHistorySchema } from "@/features/order";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
    const parsedParams = getOrderHistorySchema.parse({ id });
    const history = await getOrderHistory(parsedParams, currentUser);
    const response: ApiResponse<typeof history> = { data: history };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
