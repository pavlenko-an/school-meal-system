import { authOptions } from "@/features/auth";
import { updatePaymentStatus } from "@/features/order/lib/order";
import { updatePaymentStatusSchema } from "@/features/order/model/update-payment-status.schema";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
    const parsedData = updatePaymentStatusSchema.parse({ id });
    const order = await updatePaymentStatus(parsedData, currentUser);
    const response: ApiResponse<typeof order> = { data: order };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
