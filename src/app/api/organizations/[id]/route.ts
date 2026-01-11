import { authOptions } from "@/features/auth";
import {
  deleteOrganization,
  getOrganizationById,
  updateOrganization,
} from "@/features/organization/lib/organization";
import { deleteOrganizationSchema } from "@/features/organization/model/delete-organization.schema";
import { getOrganizationByIdSchema } from "@/features/organization/model/get-organization-by-id.schema";
import { updateOrganizationSchema } from "@/features/organization/model/update-organization.schema";
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
    const parsedParams = getOrganizationByIdSchema.parse({ id });
    const organization = await getOrganizationById(parsedParams);
    return NextResponse.json(organization);
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
    const parsedData = updateOrganizationSchema.parse({ id, ...body });
    const organization = await updateOrganization(parsedData, currentUser);
    return NextResponse.json(organization);
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

    const parsedParams = deleteOrganizationSchema.parse({ id });
    await deleteOrganization(parsedParams, currentUser);
    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (e) {
    return handleApiError(e);
  }
}
