import { authOptions } from "@/features/auth";
import { createCategory } from "@/features/category/lib/category";
import { createCategorySchema } from "@/features/category/model/create-category.schema";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const body = await req.json();
    const parsedBody = createCategorySchema.parse(body);
    const category = await createCategory(parsedBody, currentUser);
    const response: ApiResponse<typeof category> = { data: category };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
