import { authOptions } from "@/features/auth";
import { getCurrentOrganizationOrders } from "@/features/order/lib/order";
import { getCurrentOrganizationOrdersSchema } from "@/features/order/model/get-current-organization-orders.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      throw new UnauthorizedError("Unauthorized");
    }

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getCurrentOrganizationOrdersSchema.parse({ ...query });
    const user = await getCurrentOrganizationOrders(parsedQuery, currentUser);
    return NextResponse.json(user);
  } catch (e) {
    return handleApiError(e);
  }
}
