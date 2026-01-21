import {
  deleteOrderSchema,
  getOrderByIdSchema,
  updateOrderSchema,
} from "@/features/order";
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
    const parsedParams = getOrderByIdSchema.parse({ id });
    const order = await getOrderById(parsedParams, currentUser);
    const response: ApiResponse<typeof order> = { data: order };
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
    const parsedData = updateOrderSchema.parse({ id, ...body });
    const order = await updateOrder(parsedData, currentUser);
    const response: ApiResponse<typeof order> = { data: order };
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
    const parsedData = deleteOrderSchema.parse({ id });
    await deleteOrder(parsedData, currentUser);
    const response: ApiResponse<null> = {
      message: "Order deleted successfully",
    };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
