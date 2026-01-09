import { authOptions } from "@/features/auth";
import {
  createMenuItem,
  getAllMenuItems,
} from "@/features/menu-item/lib/menu-item";
import { handleApiError } from "@/shared/api/handle-api-error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const menuItems = await getAllMenuItems({ ...query });
    return NextResponse.json(menuItems);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unathorized");
    if (session.user.role !== "admin") {
      throw new AccessDeniedError("Access denied");
    }

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const menuItem = await createMenuItem({ ...body }, currentUser);
    return NextResponse.json(menuItem);
  } catch (e) {
    return handleApiError(e);
  }
}
