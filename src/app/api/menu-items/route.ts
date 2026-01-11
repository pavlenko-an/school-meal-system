import { authOptions } from "@/features/auth";
import {
  createMenuItem,
  getAllMenuItems,
} from "@/features/menu-item/lib/menu-item";
import { createMenuItemSchema } from "@/features/menu-item/model/create-menu-item.schema";
import { getAllMenuItemsSchema } from "@/features/menu-item/model/get-all-menu-items.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllMenuItemsSchema.parse(query);
    const menuItems = await getAllMenuItems(parsedQuery);
    return NextResponse.json(menuItems);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unathorized");

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const parsedBody = createMenuItemSchema.parse(body);
    const menuItem = await createMenuItem(parsedBody, currentUser);
    return NextResponse.json(menuItem);
  } catch (e) {
    return handleApiError(e);
  }
}
