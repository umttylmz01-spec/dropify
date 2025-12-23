import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!code) return NextResponse.redirect(new URL("/", url.origin));

  const supabase = createClient(supabaseUrl, supabaseAnon);
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL("/", url.origin));
}
