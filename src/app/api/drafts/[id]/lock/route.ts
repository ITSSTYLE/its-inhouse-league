import { NextResponse, type NextRequest } from "next/server";
import { apiError, assertSupabase, assertSupabaseSuccess } from "@/lib/api";
import { requireAdminPlayer } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminPlayer();
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();

    const { data: draftData, error: draftError } = await supabase
      .from("draft_lobbies")
      .update({ status: "complete", locked_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    const draft = assertSupabase(draftData, draftError);

    const { data: picksData, error: picksError } = await supabase
      .from("draft_picks")
      .select("player_id, team")
      .eq("draft_lobby_id", id);

    const picks = assertSupabase(picksData, picksError);

    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .insert({
        draft_lobby_id: id,
        blue_captain_id: draft.blue_captain_id,
        red_captain_id: draft.red_captain_id,
        created_by: admin.id
      })
      .select("*")
      .single();

    const match = assertSupabase(matchData, matchError);

    const matchPlayers = [
      { match_id: match.id, player_id: draft.blue_captain_id, team: "blue" as const },
      { match_id: match.id, player_id: draft.red_captain_id, team: "red" as const },
      ...picks.map((pick) => ({
        match_id: match.id,
        player_id: pick.player_id,
        team: pick.team
      }))
    ];

    const { error: matchPlayersError } = await supabase.from("match_players").insert(matchPlayers);
    assertSupabaseSuccess(matchPlayersError);

    return NextResponse.json({ draft, match });
  } catch (error) {
    return apiError(error);
  }
}
