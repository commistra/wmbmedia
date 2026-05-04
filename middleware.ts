import { NextResponse, type NextRequest } from "next/server";
import { isSupportedLocale, SUPPORTED_LOCALES } from "./lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (!maybeLocale) {
    const url = request.nextUrl.clone();
    url.pathname = "/id";
    const res = NextResponse.redirect(url);
    res.cookies.set("NEXT_LOCALE", "id");
    return res;
  }

  if (isSupportedLocale(maybeLocale)) {
    const res = NextResponse.next();
    res.cookies.set("NEXT_LOCALE", maybeLocale);
    return res;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${SUPPORTED_LOCALES[0]}${pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set("NEXT_LOCALE", SUPPORTED_LOCALES[0]);
  return res;
}

export const config = {
  matcher: ["/((?!_next).*)"],
};

