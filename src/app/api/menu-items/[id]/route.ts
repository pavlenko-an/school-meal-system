import {
  deleteMenuItem,
  deleteMenuItemSchema,
  getMenuItemById,
  getMenuItemByIdSchema,
  updateMenuItem,
  updateMenuItemSchema,
} from "@/features/menu-item";
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
    const user = await getCurrentUser();
    if (!user) {
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
