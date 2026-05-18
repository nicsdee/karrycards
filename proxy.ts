import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const adminRouteSecret = process.env.ADMIN_ROUTE_SECRET;
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin") {
    return new NextResponse("Not found", { status: 404 });
  }

  if (adminRouteSecret && pathname === `/${adminRouteSecret}`) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/:path*"]
};
