import {
  deleteOrderItem,
  deleteOrderItemSchema,
  getOrderItemById,
  getOrderItemByIdSchema,
  updateOrderItem,
  updateOrderItemSchema,
} from "@/features/order-item";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    if (!user) {
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
