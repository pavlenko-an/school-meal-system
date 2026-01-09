import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set({
    name: "next-auth.session-token",
    value: "",
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set({
    name: "next-auth.csrf-token",
    value: "",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
