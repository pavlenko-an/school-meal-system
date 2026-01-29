import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret,
  });

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;
  const organizationType = token.organizationType as string | null;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    pathname.startsWith("/school") &&
    (role !== "employee" || organizationType !== "school")
  ) {
    return NextResponse.redirect(new URL("/supplier/dashboard", request.url));
  }

  if (
    pathname.startsWith("/supplier") &&
    (role !== "employee" || organizationType !== "supplier")
  ) {
    return NextResponse.redirect(new URL("/school/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
