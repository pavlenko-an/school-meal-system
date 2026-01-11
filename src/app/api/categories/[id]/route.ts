import { authOptions } from "@/features/auth";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/features/category/lib/category";
import { deleteCategorySchema } from "@/features/category/model/delete-category.schema";
import { getCategoryByIdSchema } from "@/features/category/model/get-category-by-id.schema";
import { updateCategorySchema } from "@/features/category/model/update-category.schema";
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
    const parsedParams = getCategoryByIdSchema.parse({ id });
    const category = await getCategoryById(parsedParams);
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

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const parsedData = updateCategorySchema.parse({ id, ...body });
    const category = await updateCategory(parsedData, currentUser);
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

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const parsedParams = deleteCategorySchema.parse({ id });
    await deleteCategory(parsedParams, currentUser);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
