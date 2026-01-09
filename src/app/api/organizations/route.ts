import { authOptions } from "@/features/auth/lib/auth";
import {
  createOrganization,
  getAllOrganizations,
} from "@/features/organization/lib/organization";
import { handleApiError } from "@/shared/api/handle-api-error";
import { AccessDeniedError } from "@/shared/errors/access-denied.error";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import console from "node:console";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const organizations = await getAllOrganizations({ ...query });
    return NextResponse.json(organizations);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new UnauthorizedError("Unauthorized");
    if (session.user.role !== "admin") {
      throw new AccessDeniedError("Access Denied");
    }
    console.log("Session User:", session.user);

    const currentUser = {
      id: session.user.id,
      role: session.user.role,
      organizationId: session.user.organizationId,
    };

    const body = await req.json();
    const organization = await createOrganization({ ...body }, currentUser);
    return NextResponse.json(organization);
  } catch (e) {
    return handleApiError(e);
  }
}
