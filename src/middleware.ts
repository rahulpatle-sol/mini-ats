import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";

const PUBLIC_PATHS = new Set(["/login", "/api/health"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const session = await getSession();
  if (session) return NextResponse.next();

  const login = new URL("/login", req.url);
  login.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
