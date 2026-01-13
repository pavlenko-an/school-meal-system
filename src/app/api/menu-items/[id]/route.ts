import { authOptions } from "@/features/auth";
import {
  deleteMenuItem,
  getMenuItemById,
  updateMenuItem,
} from "@/features/menu-item/lib/menu-item";
import { deleteMenuItemSchema } from "@/features/menu-item/model/delete-menu-item.schema";
import { getMenuItemByIdSchema } from "@/features/menu-item/model/get-menu-item-by-id.schema";
import { updateMenuItemSchema } from "@/features/menu-item/model/update-menu-item.schema";
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
    const parsedParams = getMenuItemByIdSchema.parse({ id });
    const menuItem = await getMenuItemById(parsedParams);
    const response: ApiResponse<typeof menuItem> = { data: menuItem };
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
    const parsedData = updateMenuItemSchema.parse({ id, ...body });
    const menuItem = await updateMenuItem(parsedData, currentUser);
    const response: ApiResponse<typeof menuItem> = { data: menuItem };
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
    const parsedParams = deleteMenuItemSchema.parse({ id });
    await deleteMenuItem(parsedParams, currentUser);
    const response: ApiResponse<null> = {
      message: "Menu item deleted successfully",
    };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
