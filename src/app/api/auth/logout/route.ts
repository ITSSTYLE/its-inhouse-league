import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(getSiteUrl());
}
