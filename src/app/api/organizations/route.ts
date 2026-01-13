import { authOptions } from "@/features/auth/lib/auth";
import {
  createOrganization,
  getAllOrganizations,
} from "@/features/organization/lib/organization";
import { createOrganizationSchema } from "@/features/organization/model/create-organization.schema";
import { getAllOrganizationsSchema } from "@/features/organization/model/get-all-organizations.schema";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
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
    const session = await getServerSession(authOptions);
    if (!session?.user || !session?.user.id) {
      throw new UnauthorizedError("Unauthorized");
    }
    const currentUser = await getCurrentUser(session);
    const body = await req.json();
    const parsedBody = createOrganizationSchema.parse(body);
    const organization = await createOrganization(parsedBody, currentUser);
    const response: ApiResponse<typeof organization> = { data: organization };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
