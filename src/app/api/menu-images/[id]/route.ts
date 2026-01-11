import { authOptions } from "@/features/auth";
import {
  deleteMenuImage,
  getMenuImageById,
} from "@/features/menu-image/lib/menu-image";
import { deleteMenuImageSchema } from "@/features/menu-image/model/delete-menu-image.schema";
import { getMenuImageByIdSchema } from "@/features/menu-image/model/get-menu-image-by-id.schema";
import { updateMenuItem } from "@/features/menu-item/lib/menu-item";
import { updateMenuItemSchema } from "@/features/menu-item/model/update-menu-item.schema";
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
    const parsedParams = getMenuImageByIdSchema.parse({ id });
    const menuImage = await getMenuImageById(parsedParams);
    return NextResponse.json(menuImage);
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

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const parsedParams = deleteMenuImageSchema.parse({ id });
    await deleteMenuImage(parsedParams, currentUser);
    return NextResponse.json({ message: "Menu image deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
