import { authOptions } from "@/features/auth";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/features/category/lib/category";
import { deleteCategorySchema } from "@/features/category/model/delete-category.schema";
import { getCategoryByIdSchema } from "@/features/category/model/get-category-by-id.schema";
import { updateCategorySchema } from "@/features/category/model/update-category.schema";
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
    const parsedParams = getCategoryByIdSchema.parse({ id });
    const category = await getCategoryById(parsedParams);
    const response: ApiResponse<typeof category> = { data: category };
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
    const parsedData = updateCategorySchema.parse({ id, ...body });
    const category = await updateCategory(parsedData, currentUser);
    const response: ApiResponse<typeof category> = { data: category };
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
    const parsedParams = deleteCategorySchema.parse({ id });
    await deleteCategory(parsedParams, currentUser);
    const response: ApiResponse<null> = {
      message: "Category deleted successfully",
    };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
