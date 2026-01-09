import { authOptions } from "@/features/auth";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/features/category/lib/category";
import { handleApiError } from "@/shared/api/handle-api-error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
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
    const category = await getCategoryById({ id });
    return NextResponse.json(category);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    if (session.user.role !== "admin") {
      throw new AccessDeniedError("Access Denied");
    }

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const category = await updateCategory({ ...body, id }, currentUser);
    return NextResponse.json(category);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
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

    await deleteCategory({ id }, currentUser);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
