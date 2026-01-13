import { authOptions } from "@/features/auth";
import { getMyOrganizationOrders } from "@/features/order/lib/order";
import { getMyOrganizationOrdersSchema } from "@/features/order/model/get-my-organization-orders.schema";
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
    const parsedQuery = getMyOrganizationOrdersSchema.parse(query);
    const orders = await getMyOrganizationOrders(parsedQuery, currentUser);
    const response: ApiResponse<typeof orders> = { data: orders };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
