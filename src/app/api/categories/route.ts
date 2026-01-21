import { createCategory, createCategorySchema } from "@/features/category";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
    const body = await req.json();
    const parsedBody = createCategorySchema.parse(body);
    const category = await createCategory(parsedBody, currentUser);
    const response: ApiResponse<typeof category> = { data: category };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
