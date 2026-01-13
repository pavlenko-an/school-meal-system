import { authOptions } from "@/features/auth";
import { getOrderHistory } from "@/features/order/lib/order";
import { getOrderHistorySchema } from "@/features/order/model/get-order-history.schema";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const parsedParams = getOrderHistorySchema.parse({ id });
    const history = await getOrderHistory(parsedParams, currentUser);
    const response: ApiResponse<typeof history> = { data: history };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
