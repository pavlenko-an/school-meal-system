import {
  deleteMenuImage,
  deleteMenuImageSchema,
  getMenuImageById,
  getMenuImageByIdSchema,
  updateMenuImage,
  updateMenuImageSchema,
} from "@/features/menu-image";
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
