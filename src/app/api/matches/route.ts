import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, assertSupabase, assertSupabaseSuccess } from "@/lib/api";
import { requireAdminPlayer } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const createMatchSchema = z.object({
  blueCaptainId: z.string().uuid(),
  redCaptainId: z.string().uuid(),
  players: z.array(
    z.object({
      playerId: z.string().uuid(),
      team: z.enum(["blue", "red"])
    })
  )
});

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("matches")
      .select("*, blue_captain:players!matches_blue_captain_id_fkey(*), red_captain:players!matches_red_captain_id_fkey(*), match_players(*, player:players(*)), match_confirmations(*)")
      .order("created_at", { ascending: false });

    return NextResponse.json({ matches: assertSupabase(data, error) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminPlayer();
    const body = createMatchSchema.parse(await request.json());
    const supabase = await createServerSupabaseClient();

    const { data: matchData, error } = await supabase
      .from("matches")
      .insert({
        blue_captain_id: body.blueCaptainId,
        red_captain_id: body.redCaptainId,
        created_by: admin.id
      })
      .select("*")
      .single();

    const match = assertSupabase(matchData, error);

    const matchPlayers = body.players.map((player) => ({
      match_id: match.id,
      player_id: player.playerId,
      team: player.team
    }));

    const { error: playersError } = await supabase.from("match_players").insert(matchPlayers);
    assertSupabaseSuccess(playersError);

    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
