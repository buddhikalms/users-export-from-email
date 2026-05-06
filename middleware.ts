export { default } from "next-auth/middleware";

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
