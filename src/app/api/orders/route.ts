import {
  createOrderSchema,
  getAllOrdersSchema,
} from "@/features/order";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllOrdersSchema.parse(query);
    const orders = await getAllOrders(parsedQuery, currentUser);
    const response: ApiResponse<typeof orders> = { data: orders };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const parsedBody = createOrderSchema.parse(body);
    const order = await createOrder(parsedBody, currentUser);
    const response: ApiResponse<typeof order> = { data: order };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
