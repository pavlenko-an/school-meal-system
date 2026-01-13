import { authOptions } from "@/features/auth";
import {
  deleteOrganization,
  getOrganizationById,
  updateOrganization,
} from "@/features/organization/lib/organization";
import { deleteOrganizationSchema } from "@/features/organization/model/delete-organization.schema";
import { getOrganizationByIdSchema } from "@/features/organization/model/get-organization-by-id.schema";
import { updateOrganizationSchema } from "@/features/organization/model/update-organization.schema";
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
    const parsedParams = getOrganizationByIdSchema.parse({ id });
    const organization = await getOrganizationById(parsedParams);
    const response: ApiResponse<typeof organization> = { data: organization };
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
    const parsedData = updateOrganizationSchema.parse({ id, ...body });
    const organization = await updateOrganization(parsedData, currentUser);
    const response: ApiResponse<typeof organization> = { data: organization };
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
    const parsedParams = deleteOrganizationSchema.parse({ id });
    await deleteOrganization(parsedParams, currentUser);
    const response: ApiResponse<{ message: string }> = {
      data: { message: "Organization deleted successfully" },
    };
    return NextResponse.json(response);
  } catch (e) {
    return handleApiError(e);
  }
}
