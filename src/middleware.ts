import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth-admin";
import { mergeSupabaseCookieOptions } from "@/lib/cookie-options";
import {
  pathRequiresAuth,
  pathRequiresSofAuth,
  SOF_LOGIN_PATH,
  SOF_REQUEST_ACCESS_PATH,
  SOF_SECURE_HOME,
} from "@/lib/auth-routes";
import { SOF_NOT_APPROVED_QUERY, userCanAccessSofSecure, userHasSofAccessFromMetadata } from "@/lib/sof-membership";

const publicPaths = ["/login", "/request-access", "/auth/callback", "/auth/confirm", "/auth/reset-password", "/accept-invite", "/api/auth"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function safeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function resolveAdminPostLoginPath(redirectTo: string | null, userEmail: string | undefined): string {
  const safe = safeRedirectPath(redirectTo);
  if (safe !== "/" && pathRequiresAuth(safe) && !isAdminEmail(userEmail)) {
    return "/";
  }
  if (safe !== "/") return safe;
  if (isAdminEmail(userEmail)) {
    return "/admin";
  }
  return "/";
}

function resolveSofPostLoginPath(redirectTo: string | null): string {
  const safe = safeRedirectPath(redirectTo);
  if (safe.startsWith("/sof-solutions/secure")) return safe;
  return SOF_SECURE_HOME;
}

/** Skip Supabase session work on public marketing/static routes. */
function shouldRunAuthMiddleware(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.includes(".")) return false;

  if (pathname.startsWith("/admin")) return true;
  if (pathRequiresAuth(pathname)) return true;
  if (pathRequiresSofAuth(pathname)) return true;
  if (pathname === SOF_LOGIN_PATH || pathname.startsWith("/login")) return true;
  if (pathname.startsWith("/accept-invite")) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/sof-solutions/secure/workspace")) {
    return NextResponse.redirect(new URL(SOF_SECURE_HOME, request.url));
  }

  if (!shouldRunAuthMiddleware(pathname)) {
    return NextResponse.next({ request });
  }

  // A copy of the site with no member database (no Supabase keys, as on the redesign preview):
  // show a plain page instead of letting the sign-in, portal and admin routes fail with a 500.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.rewrite(new URL("/sign-in-unavailable", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, mergeSupabaseCookieOptions(options)),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isStaticOrApi =
    pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".");

  if (pathname.startsWith("/admin")) {
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathRequiresSofAuth(pathname) && !user && !isStaticOrApi) {
    const redirectUrl = new URL(SOF_LOGIN_PATH, request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathRequiresSofAuth(pathname) && user && !isStaticOrApi) {
    const allowed = await userCanAccessSofSecure(user);
    if (!allowed) {
      const redirectUrl = new URL(SOF_LOGIN_PATH, request.url);
      redirectUrl.searchParams.set(SOF_NOT_APPROVED_QUERY, "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathRequiresAuth(pathname) && !user && !isStaticOrApi && !isPublicPath(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathRequiresAuth(pathname) && user && !isStaticOrApi && !isAdminEmail(user.email)) {
    const redirectUrl = pathname.startsWith("/admin") ? new URL("/login", request.url) : new URL("/", request.url);
    if (pathname.startsWith("/admin")) {
      redirectUrl.searchParams.set("redirectTo", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === SOF_LOGIN_PATH && user) {
    const allowed = await userCanAccessSofSecure(user);
    if (allowed) {
      const redirectTo = request.nextUrl.searchParams.get("redirectTo");
      const target = resolveSofPostLoginPath(redirectTo);
      return NextResponse.redirect(new URL(target, request.url));
    }
    if (!userHasSofAccessFromMetadata(user)) {
      const redirectUrl = new URL(SOF_REQUEST_ACCESS_PATH, request.url);
      redirectUrl.searchParams.set(SOF_NOT_APPROVED_QUERY, "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Only skip /login for users already signed in as an operator/admin.
  // Non-admin sessions must reach the form so they can sign out and use operator credentials.
  if (pathname.startsWith("/login") && user && isAdminEmail(user.email)) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const target = resolveAdminPostLoginPath(redirectTo, user.email);
    return NextResponse.redirect(new URL(target, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
