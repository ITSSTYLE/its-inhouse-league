import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireEnv } from "@/lib/env";
import { upsertPlayerForDiscordUser } from "@/lib/players";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = new URL("/", request.url);
  const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = [];

  if (!code) {
    redirectTo.searchParams.set("auth_error", "missing_code");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = createServerClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(nextCookies: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.push(...nextCookies);
        }
      }
    }
  ) as unknown as SupabaseClient<Database>;

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    redirectTo.searchParams.set("auth_error", error?.message ?? "session_exchange_failed");
    const response = NextResponse.redirect(redirectTo);
    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    return response;
  }

  try {
    await upsertPlayerForDiscordUser(data.user);
  } catch (error) {
    redirectTo.searchParams.set("auth_error", error instanceof Error ? error.message : "player_sync_failed");
  }

  const response = NextResponse.redirect(redirectTo);
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));

  return response;
}
