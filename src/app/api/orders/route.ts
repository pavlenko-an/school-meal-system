import { authOptions } from "@/features/auth";
import { createOrder, getAllOrders } from "@/features/order/lib/order";
import { createOrderSchema } from "@/features/order/model/create-order.schema";
import { getAllOrdersSchema } from "@/features/order/model/get-all-orders.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { CurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllOrdersSchema.parse(query);
    const orders = await getAllOrders(parsedQuery);
    return NextResponse.json(orders);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser: CurrentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
      organizationType: session.user.organizationType,
    };

    const body = await req.json();
    const parsedBody = createOrderSchema.parse(body);
    const order = await createOrder(parsedBody, currentUser);
    return NextResponse.json(order);
  } catch (e) {
    return handleApiError(e);
  }
}
