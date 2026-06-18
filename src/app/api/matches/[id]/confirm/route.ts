import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, assertSupabase, assertSupabaseSuccess } from "@/lib/api";
import { requireCurrentPlayer } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const confirmationSchema = z.object({
  winningTeam: z.enum(["blue", "red"])
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const captain = await requireCurrentPlayer();
    const { id } = await context.params;
    const body = confirmationSchema.parse(await request.json());
    const supabase = await createServerSupabaseClient();

    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    const match = assertSupabase(matchData, matchError);

    if (match.status !== "pending_confirmation") {
      return NextResponse.json({ error: "Match has already been finalized" }, { status: 409 });
    }

    if (![match.blue_captain_id, match.red_captain_id].includes(captain.id)) {
      return NextResponse.json({ error: "Only captains can confirm results" }, { status: 403 });
    }

    const { data: confirmationData, error: confirmationError } = await supabase
      .from("match_confirmations")
      .insert({
        match_id: id,
        captain_id: captain.id,
        winning_team: body.winningTeam
      })
      .select("*")
      .single();

    const confirmation = assertSupabase(confirmationData, confirmationError);

    const { data: confirmationsData, error: confirmationsError } = await supabase
      .from("match_confirmations")
      .select("*")
      .eq("match_id", id);

    const confirmations = assertSupabase(confirmationsData, confirmationsError);

    const bothCaptainsConfirmed = confirmations.length === 2;
    const sameWinner = confirmations.every((item) => item.winning_team === body.winningTeam);

    if (bothCaptainsConfirmed && !sameWinner) {
      return NextResponse.json(
        { confirmation, finalized: false, error: "Captains submitted different winners" },
        { status: 409 }
      );
    }

    if (bothCaptainsConfirmed && sameWinner) {
      const { error: updateError } = await supabase
        .from("matches")
        .update({
          winning_team: body.winningTeam,
          status: "confirmed",
          confirmed_at: new Date().toISOString()
        })
        .eq("id", id);

      assertSupabaseSuccess(updateError);
      await supabase.rpc("apply_match_result", { target_match_id: id });
    }

    return NextResponse.json({ confirmation, finalized: bothCaptainsConfirmed && sameWinner });
  } catch (error) {
    return apiError(error);
  }
}
