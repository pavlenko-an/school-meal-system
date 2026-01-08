import { authOptions } from "@/features/auth";
import {
  createMenuItem,
  getAllMenuItems,
} from "@/features/menu-item/lib/menu-item";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());

  try {
    const menuItems = await getAllMenuItems({ ...query });
    return NextResponse.json(menuItems);
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const menuItem = await createMenuItem({ ...body }, currentUser);
    return NextResponse.json(menuItem);
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 400 }
    );
  }
}
