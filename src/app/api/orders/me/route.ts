import { authOptions } from "@/features/auth";
import { getSchoolOrders, getSupplierOrders } from "@/features/order/lib/order";
import { getCurrentOrganizationOrdersSchema } from "@/features/order/model/get-current-organization-orders.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { CurrentUser } from "@/shared/auth/current-user";
import { ConflictError } from "@/shared/errors/conflict.error";
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

    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getCurrentOrganizationOrdersSchema.parse(query);

    let orders;
    if (currentUser.organizationType === "school") {
      orders = await getSchoolOrders(parsedQuery, currentUser);
    } else if (currentUser.organizationType === "supplier") {
      orders = await getSupplierOrders(parsedQuery, currentUser);
    } else {
      throw new ConflictError("Unknown organization type");
    }
    return NextResponse.json(orders);
  } catch (e) {
    return handleApiError(e);
  }
}
