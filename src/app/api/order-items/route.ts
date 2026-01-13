import { authOptions } from "@/features/auth";
import {
  createOrderItem,
  getAllOrderItems,
} from "@/features/order-item/lib/order-item";
import { createOrderItemSchema } from "@/features/order-item/model/create-order-item.schema";
import { getAllOrderItemsSchema } from "@/features/order-item/model/get-all-order-items.schema";
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
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllOrderItemsSchema.parse(query);
    const orderItems = await getAllOrderItems(parsedQuery);
    const response: ApiResponse<typeof orderItems> = { data: orderItems };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const body = await req.json();
    const parsedBody = createOrderItemSchema.parse(body);
    const orderItem = await createOrderItem(parsedBody, currentUser);
    const response: ApiResponse<typeof orderItem> = { data: orderItem };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
