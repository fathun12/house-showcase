import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/lib/i18n/routing";

const handleI18n = createMiddleware(routing);

const locales = routing.locales.join("|");
const ADMIN_PATH = new RegExp(`^/(${locales})/admin(/|$)`);
const LOGIN_PATH = new RegExp(`^/(${locales})/admin/login/?$`);

function redirectWithCookies(
  request: NextRequest,
  pathname: string,
  from: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));

  return redirect;
}

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);
  const { pathname } = request.nextUrl;

  // Visitor pages and language redirects: nothing more to check
  if (!ADMIN_PATH.test(pathname) || response.headers.has("location")) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const isLoginPage = LOGIN_PATH.test(pathname);
  const locale = pathname.split("/")[1];

  if (!isLoggedIn && !isLoginPage) {
    return redirectWithCookies(request, `/${locale}/admin/login`, response);
  }

  if (isLoggedIn && isLoginPage) {
    return redirectWithCookies(request, `/${locale}/admin`, response);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};