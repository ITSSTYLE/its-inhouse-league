import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
      scopes: "identify email"
    }
  });

  if (error || !data.url) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to start Discord login." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}