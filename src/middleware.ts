import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

async function valid(token?: string) {
  if (!token) return false;
  try { await jwtVerify(token, secret); return true; } catch { return false; }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/api/auth/login") return NextResponse.next();

  const ok = await valid(req.cookies.get("hf_session")?.value);
  const isApi = pathname.startsWith("/api");

  if (!ok) {
    if (pathname === "/login") return NextResponse.next();
    if (isApi) {
      return new NextResponse(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { "content-type": "application/json" },
      });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
