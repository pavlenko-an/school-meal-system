import { authOptions } from "@/features/auth";
import {
  deleteMenuImage,
  getMenuImageById,
  updateMenuImage,
} from "@/features/menu-image/lib/menu-image";
import { deleteMenuImageSchema } from "@/features/menu-image/model/delete-menu-image.schema";
import { getMenuImageByIdSchema } from "@/features/menu-image/model/get-menu-image-by-id.schema";
import { updateMenuImageSchema } from "@/features/menu-image/model/update-menu-image.schema";
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
    const parsedParams = getMenuImageByIdSchema.parse({ id });
    const menuImage = await getMenuImageById(parsedParams);
    const response: ApiResponse<typeof menuImage> = { data: menuImage };
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
    const parsedData = updateMenuImageSchema.parse({ id, ...body });
    const menuImage = await updateMenuImage(parsedData, currentUser);
    const response: ApiResponse<typeof menuImage> = { data: menuImage };
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
    const parsedParams = deleteMenuImageSchema.parse({ id });
    await deleteMenuImage(parsedParams, currentUser);
    const response: ApiResponse<null> = {
      message: "Menu image deleted successfully",
    };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
