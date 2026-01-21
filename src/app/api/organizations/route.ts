import {
  createOrganization,
  createOrganizationSchema,
  getAllOrganizations,
  getAllOrganizationsSchema,
} from "@/features/organization";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllOrganizationsSchema.parse(query);
    const organizations = await getAllOrganizations(parsedQuery);
    const response: ApiResponse<typeof organizations> = { data: organizations };
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
    const parsedBody = createOrganizationSchema.parse(body);
    const organization = await createOrganization(parsedBody, currentUser);
    const response: ApiResponse<typeof organization> = { data: organization };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
