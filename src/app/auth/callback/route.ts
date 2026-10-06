import { NextRequest, NextResponse } from "next/server";
import { tryCreateAuthServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation", request.url),
    );
  }

  const supabase = await tryCreateAuthServerClient();
  if (!supabase) {
    return NextResponse.redirect(
      new URL("/login?error=configuration", request.url),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Supabase confirmation callback failed:", error);
    return NextResponse.redirect(
      new URL("/login?error=confirmation", request.url),
    );
  }

  return NextResponse.redirect(new URL("/", request.url));
}
