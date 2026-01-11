import { authOptions } from "@/features/auth";
import {
  getOrderItemById,
  updateOrderItem,
} from "@/features/order-item/lib/order-item";
import { getOrderItemByIdSchema } from "@/features/order-item/model/get-order-item-by-id.schema";
import { updateOrderItemSchema } from "@/features/order-item/model/update-order-item.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    const parsedParams = getOrderItemByIdSchema.parse({ id });
    const orderItem = await getOrderItemById(parsedParams);
    return NextResponse.json(orderItem);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const parsedData = updateOrderItemSchema.parse({ id, ...body });
    const orderItem = await updateOrderItem(parsedData, currentUser);
    return NextResponse.json(orderItem);
  } catch (e) {
    return handleApiError(e);
  }
}
