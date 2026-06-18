import { NextResponse } from "next/server";
import { apiError, assertSupabase } from "@/lib/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("joined_at", { ascending: true });

    return NextResponse.json({ players: assertSupabase(data, error) });
  } catch (error) {
    return apiError(error);
  }
}
