import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, assertSupabase } from "@/lib/api";
import { requireAdminPlayer } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const overrideSchema = z.object({
  winningTeam: z.enum(["blue", "red"])
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminPlayer();
    const { id } = await context.params;
    const body = overrideSchema.parse(await request.json());
    const supabase = await createServerSupabaseClient();

    const { data: currentMatchData, error: currentMatchError } = await supabase
      .from("matches")
      .select("status")
      .eq("id", id)
      .single();

    const currentMatch = assertSupabase(currentMatchData, currentMatchError);

    if (currentMatch.status !== "pending_confirmation") {
      return NextResponse.json({ error: "Match has already been finalized" }, { status: 409 });
    }

    const { data: matchData, error } = await supabase
      .from("matches")
      .update({
        winning_team: body.winningTeam,
        status: "overridden",
        confirmed_at: new Date().toISOString(),
        overridden_by: admin.id
      })
      .eq("id", id)
      .select("*")
      .single();

    const match = assertSupabase(matchData, error);
    await supabase.rpc("apply_match_result", { target_match_id: id });

    return NextResponse.json({ match });
  } catch (error) {
    return apiError(error);
  }
}
