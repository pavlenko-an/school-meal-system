import { authOptions } from "@/features/auth";
import {
  deleteOrder,
  getOrderById,
  updateOrder,
} from "@/features/order/lib/order";
import { deleteOrderSchema } from "@/features/order/model/delete-order.schema";
import { getOrderByIdSchema } from "@/features/order/model/get-order-by-id.schema";
import { updateOrderSchema } from "@/features/order/model/update-order.schema";
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
    const currentUser = await getCurrentUser(session);
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
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
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
