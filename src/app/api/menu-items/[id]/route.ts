import { authOptions } from "@/features/auth";
import {
  deleteMenuItem,
  getMenuItemById,
  updateMenuItem,
} from "@/features/menu-item/lib/menu-item";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, context: { params: Params }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const menuItem = await getMenuItemById({ id });
    return NextResponse.json(menuItem);
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
  if (session.user.role !== "admin") {
    return NextResponse.json({ message: "Access Denied" }, { status: 403 });
  }

  const currentUser = {
    id: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };

  const body = await req.json();
  try {
    const menuItem = await updateMenuItem({ ...body, id }, currentUser);
    return NextResponse.json(menuItem);
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
    await deleteMenuItem({ id }, currentUser);
    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 400 }
    );
  }
}
