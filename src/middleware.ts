import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured =
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    supabaseKey &&
    supabaseKey !== "your-supabase-anon-key";

  if (!isSupabaseConfigured) {
    return intlMiddleware(request);
  }

  // Create a response container to let Supabase write modified cookie headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session if it's close to expiring
  try {
    await supabase.auth.getUser();
  } catch (err) {
    console.error("Supabase auth session refresh error in middleware:", err);
  }

  // Run next-intl middleware
  const intlResponse = intlMiddleware(request);

  // Copy any refreshed session cookies set by Supabase over to the intl response
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(pl|en)/:path*", "/((?!_next|_vercel|studio|auth|.*\\..*).*)"],
};
