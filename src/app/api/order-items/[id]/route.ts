import { authOptions } from "@/features/auth";
import {
  deleteOrderItem,
  getOrderItemById,
  updateOrderItem,
} from "@/features/order-item/lib/order-item";
import { deleteOrderItemSchema } from "@/features/order-item/model/delete-order-item.schema";
import { getOrderItemByIdSchema } from "@/features/order-item/model/get-order-item-by-id.schema";
import { updateOrderItemSchema } from "@/features/order-item/model/update-order-item.schema";
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
    const parsedParams = getOrderItemByIdSchema.parse({ id });
    const orderItem = await getOrderItemById(parsedParams);
    const response: ApiResponse<typeof orderItem> = { data: orderItem };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
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
    const body = await req.json();
    const parsedData = updateOrderItemSchema.parse({ id, ...body });
    const orderItem = await updateOrderItem(parsedData, currentUser);
    const response: ApiResponse<typeof orderItem> = { data: orderItem };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
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
    const parsedParams = deleteOrderItemSchema.parse({ id });
    await deleteOrderItem(parsedParams, currentUser);
    const response: ApiResponse<null> = {
      message: "Order item deleted successfully",
    };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
