import { authOptions } from "@/features/auth";
import {
  deleteMenuItem,
  getMenuItemById,
  updateMenuItem,
} from "@/features/menu-item/lib/menu-item";
import { deleteMenuItemSchema } from "@/features/menu-item/model/delete-menu-item.schema";
import { getMenuItemByIdSchema } from "@/features/menu-item/model/get-menu-item-by-id.schema";
import { updateMenuItemSchema } from "@/features/menu-item/model/update-menu-item.schema";
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
    const parsedParams = getMenuItemByIdSchema.parse({ id });
    const menuItem = await getMenuItemById(parsedParams);
    return NextResponse.json(menuItem);
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
    const parsedData = updateMenuItemSchema.parse({ id, ...body });
    const menuItem = await updateMenuItem(parsedData, currentUser);
    return NextResponse.json(menuItem);
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

    const parsedParams = deleteMenuItemSchema.parse({ id });
    await deleteMenuItem(parsedParams, currentUser);
    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
