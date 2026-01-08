import { authOptions } from "@/features/auth";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/features/category/lib/category";
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
    const category = await getCategoryById({ id });
    return NextResponse.json(category);
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
    const category = await updateCategory({ ...body, id }, currentUser);
    return NextResponse.json(category);
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
    await deleteCategory({ id }, currentUser);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 400 }
    );
  }
}
