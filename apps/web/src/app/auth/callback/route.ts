import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  const redirectUrl = new URL(next, requestUrl.origin);
  let response = NextResponse.redirect(redirectUrl);

  if (!code) {
    return NextResponse.redirect(
      new URL(`/support?err=${encodeURIComponent("Missing code")}`, requestUrl.origin)
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // DEBUG: hangi cookie/option geliyor gör
          console.log("[callback] cookiesToSet:", cookiesToSet);

          cookiesToSet.forEach(({ name, value, options }) => {
            const opts: any = { ...options };

            // localhost / http için kritik: secure=false yoksa tarayıcı cookie'yi atar
            if (requestUrl.protocol === "http:") opts.secure = false;

            // Dev için daha stabil
            if (!opts.sameSite) opts.sameSite = "lax";
            if (!opts.path) opts.path = "/";

            response.cookies.set(name, value, opts);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/support?err=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }

  return response;
}
