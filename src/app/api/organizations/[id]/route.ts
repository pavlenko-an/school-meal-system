import {
  deleteOrganization,
  deleteOrganizationSchema,
  getOrganizationById,
  getOrganizationByIdSchema,
  updateOrganization,
  updateOrganizationSchema,
} from "@/features/organization";
import { ApiResponse } from "@/shared/api/api-response";
import { handleApiError } from "@/shared/api/handle-api-error";
import { getCurrentUser } from "@/shared/auth/current-user";
import { UnauthorizedError } from "@/shared/errors/unauthorized-error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } },
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
  context: { params: { id: string } },
) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new UnauthorizedError("Unauthorized");
    }
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
