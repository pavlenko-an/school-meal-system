import { authOptions } from "@/features/auth";
import {
  deleteOrderItem,
  getOrderItemById,
  updateOrderItem,
} from "@/features/order-item/lib/order-item";
import { deleteOrderItemSchema } from "@/features/order-item/model/delete-order-item.schema";
import { getOrderItemByIdSchema } from "@/features/order-item/model/get-order-item-by-id.schema";
import { updateOrderItemSchema } from "@/features/order-item/model/update-order-item.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { CurrentUser } from "@/shared/auth/current-user";
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

    const currentUser: CurrentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
      organizationType: session.user.organizationType,
    };

    const body = await req.json();
    const parsedData = updateOrderItemSchema.parse({ id, ...body });
    const orderItem = await updateOrderItem(parsedData, currentUser);
    return NextResponse.json(orderItem);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser: CurrentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
      organizationType: session.user.organizationType,
    };

    const parsedParams = deleteOrderItemSchema.parse({ id });
    const orderItem = await deleteOrderItem(parsedParams, currentUser);
    return NextResponse.json(orderItem);
  } catch (e) {
    return handleApiError(e);
  }
}
