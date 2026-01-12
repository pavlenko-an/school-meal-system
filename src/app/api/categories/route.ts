import { authOptions } from "@/features/auth";
import {
  createCategory,
  getAllCategories,
} from "@/features/category/lib/category";
import { createCategorySchema } from "@/features/category/model/create-category.schema";
import { getAllCategoriesSchema } from "@/features/category/model/get-all-categories.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { CurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllCategoriesSchema.parse(query);
    const categories = await getAllCategories(parsedQuery);
    return NextResponse.json(categories);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser: CurrentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
      organizationType: session.user.organizationType,
    };

    const body = await req.json();
    const parsedBody = createCategorySchema.parse(body);
    const category = await createCategory(parsedBody, currentUser);
    return NextResponse.json(category);
  } catch (e) {
    return handleApiError(e);
  }
}
