import { authOptions } from "@/features/auth";
import {
  createCategory,
  getAllCategories,
} from "@/features/category/lib/category";
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
    const categories = await getAllCategories({ ...query });
    return NextResponse.json(categories);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    if (session.user.role !== "admin") {
      throw new AccessDeniedError("Access denied");
    }

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const category = await createCategory({ ...body }, currentUser);
    return NextResponse.json(category);
  } catch (e) {
    return handleApiError(e);
  }
}
