import { authOptions } from "@/features/auth";
import {
  createMenuImage,
  getAllMenuImages,
} from "@/features/menu-image/lib/menu-image";
import { createMenuImageSchema } from "@/features/menu-image/model/create-menu-image.schema";
import { getAllMenuImagesSchema } from "@/features/menu-image/model/get-all-menu-images.schema";
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
    const parsedQuery = getAllMenuImagesSchema.parse(query);
    const menuImages = await getAllMenuImages({ ...parsedQuery });
    return NextResponse.json(menuImages);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const parsedBody = createMenuImageSchema.parse({ ...body });
    const menuImage = await createMenuImage(parsedBody, currentUser);
    return NextResponse.json(menuImage);
  } catch (e) {
    return handleApiError(e);
  }
}
