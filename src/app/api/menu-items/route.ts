import { authOptions } from "@/features/auth";
import {
  createMenuItem,
  getAllMenuItems,
} from "@/features/menu-item/lib/menu-item";
import { createMenuItemSchema } from "@/features/menu-item/model/create-menu-item.schema";
import { getAllMenuItemsSchema } from "@/features/menu-item/model/get-all-menu-items.schema";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllMenuItemsSchema.parse(query);
    const menuItems = await getAllMenuItems(parsedQuery);
    const response: ApiResponse<typeof menuItems> = { data: menuItems };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const body = await req.json();
    const parsedBody = createMenuItemSchema.parse(body);
    const menuItem = await createMenuItem(parsedBody, currentUser);
    const response: ApiResponse<typeof menuItem> = { data: menuItem };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
