import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminPathPrefix = "/admin";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  if (!token) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  if (
    request.nextUrl.pathname.startsWith(adminPathPrefix) &&
    token.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/folders/:path*",
    "/results/:path*",
    "/export/:path*",
    "/admin/:path*",
    "/api/accounts/:path*",
    "/api/imap/:path*",
    "/api/export/:path*",
  ],
};
