import {
  createMenuImage,
  createMenuImageSchema,
  getAllMenuImages,
  getAllMenuImagesSchema,
} from "@/features/menu-image";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError("Unauthorized");
    }
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllMenuImagesSchema.parse(query);
    const menuImages = await getAllMenuImages(parsedQuery);
    const response: ApiResponse<typeof menuImages> = { data: menuImages };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
    const body = await req.json();
    const parsedBody = createMenuImageSchema.parse(body);
    const menuImage = await createMenuImage(parsedBody, currentUser);
    const response: ApiResponse<typeof menuImage> = { data: menuImage };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
