import { authOptions } from "@/features/auth";
import {
  createOrderItem,
  getAllOrderItems,
} from "@/features/order-item/lib/order-item";
import { createOrderItemSchema } from "@/features/order-item/model/create-order-item.schema";
import { getAllOrderItemsSchema } from "@/features/order-item/model/get-all-order-items.schema";
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
    const parsedQuery = getAllOrderItemsSchema.parse(query);
    const orderItems = await getAllOrderItems(parsedQuery);
    return NextResponse.json(orderItems);
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
    const parsedBody = createOrderItemSchema.parse(body);
    const orderItem = await createOrderItem(parsedBody, currentUser);
    return NextResponse.json(orderItem);
  } catch (e) {
    return handleApiError(e);
  }
}
