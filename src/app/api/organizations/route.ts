import { authOptions } from "@/features/auth/lib/auth";
import {
  createOrganization,
  getAllOrganizations,
} from "@/features/organization/lib/organization";
import { createOrganizationSchema } from "@/features/organization/model/create-organization.schema";
import { getAllOrganizationsSchema } from "@/features/organization/model/get-all-organizations.schema";
import { handleApiError } from "@/shared/api/handle-api-error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = getAllOrganizationsSchema.parse(query);
    const organizations = await getAllOrganizations(parsedQuery);
    return NextResponse.json(organizations);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const parsedBody = createOrganizationSchema.parse(body);
    const organization = await createOrganization(parsedBody, currentUser);
    return NextResponse.json(organization);
  } catch (e) {
    return handleApiError(e);
  }
}
