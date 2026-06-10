import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/verify-email",
  "/features",
  "/pricing",
  "/how-it-works",
  "/resources",
  "/help",
  "/contact",
  "/blog",
  "/schools",
  "/schools/demo",
  "/schools/demo/success",
  "/privacy",
  "/terms",
  "/cookies",
  "/admin/emails",
];

const publicApiPrefixes = ["/api/auth", "/api/stripe/webhook", "/api/games/share", "/api/library"];

const publicPagePrefixes = ["/games/share", "/library"];

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  const isPublicApiRoute = publicApiPrefixes.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );

  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  const isPublicRoute =
    publicRoutes.includes(nextUrl.pathname) ||
    publicRoutes.some((r) => nextUrl.pathname.startsWith(r + "?")) ||
    publicPagePrefixes.some((prefix) => nextUrl.pathname.startsWith(prefix));

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    }
  );

  const isLoggedIn = !!session;

  if (isPublicRoute) {
    if (
      isLoggedIn &&
      (nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up")
    ) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(
      nextUrl.pathname + nextUrl.search
    );
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude `.netlify/*` so Netlify Functions (e.g. background workers
    // triggered server-side without a session cookie) are not redirected to
    // /sign-in by auth middleware. Those functions enforce their own auth.
    "/((?!_next/static|_next/image|favicon.ico|\\.netlify|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
