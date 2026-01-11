import { authOptions } from "@/features/auth";
import { getOrderById, updateOrder } from "@/features/order/lib/order";
import { getOrderByIdSchema } from "@/features/order/model/get-order-by-id.schema";
import { updateOrderSchema } from "@/features/order/model/update-order.schema";
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

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const parsedData = updateOrderSchema.parse({ id, ...body });
    const order = await updateOrder(parsedData, currentUser);
    return NextResponse.json(order);
  } catch (e) {
    return handleApiError(e);
  }
}
