import { authOptions } from "@/features/auth";
import {
  deleteOrganization,
  getOrganizationById,
  updateOrganization,
} from "@/features/organization/lib/organization";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const organization = await getOrganizationById({ id });
    return NextResponse.json(organization);
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Params }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.organizationId !== id) {
    return NextResponse.json({ message: "Access Denied" }, { status: 403 });
  }

  const currentUser = {
    id: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };
  const body = await req.json();

  try {
    const user = await updateOrganization({ ...body, id }, currentUser);
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") {
    return NextResponse.json({ message: "Access Denied" }, { status: 403 });
  }

  const currentUser = {
    id: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };

  try {
    await deleteOrganization({ id }, currentUser);
    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 400 }
    );
  }
}
