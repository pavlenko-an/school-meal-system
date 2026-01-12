import { authOptions } from "@/features/auth";
import {
  deleteOrder,
  getOrderById,
  updateOrder,
} from "@/features/order/lib/order";
import { deleteOrderSchema } from "@/features/order/model/delete-order.schema";
import { getOrderByIdSchema } from "@/features/order/model/get-order-by-id.schema";
import { updateOrderSchema } from "@/features/order/model/update-order.schema";
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
    const parsedParams = getOrderByIdSchema.parse({ id });
    const order = await getOrderById(parsedParams);
    return NextResponse.json(order);
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
    const parsedData = updateOrderSchema.parse({ id, ...body });
    const order = await updateOrder(parsedData, currentUser);
    return NextResponse.json(order);
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

    const parsedData = deleteOrderSchema.parse({ id });
    const order = await deleteOrder(parsedData, currentUser);
    return NextResponse.json(order);
  } catch (e) {
    return handleApiError(e);
  }
}
