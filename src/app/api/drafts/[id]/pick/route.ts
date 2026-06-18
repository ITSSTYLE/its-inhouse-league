import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, assertSupabase } from "@/lib/api";
import { requireCurrentPlayer } from "@/lib/auth";
import { isCaptainForTeam, oppositeTeam } from "@/lib/matches";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const pickSchema = z.object({
  playerId: z.string().uuid()
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const picker = await requireCurrentPlayer();
    const { id } = await context.params;
    const body = pickSchema.parse(await request.json());
    const supabase = await createServerSupabaseClient();

    const { data: draftData, error: draftError } = await supabase
      .from("draft_lobbies")
      .select("*")
      .eq("id", id)
      .single();

    const draft = assertSupabase(draftData, draftError);

    if (draft.status !== "drafting") {
      return NextResponse.json({ error: "Draft is not active" }, { status: 409 });
    }

    if (
      picker.role !== "admin" &&
      !isCaptainForTeam({
        playerId: picker.id,
        team: draft.current_pick_team,
        blueCaptainId: draft.blue_captain_id,
        redCaptainId: draft.red_captain_id
      })
    ) {
      return NextResponse.json({ error: "It is not your pick" }, { status: 403 });
    }

    const { count, error: countError } = await supabase
      .from("draft_picks")
      .select("id", { count: "exact", head: true })
      .eq("draft_lobby_id", id);

    const pickCount = assertSupabase(count, countError);

    const pickNumber = pickCount + 1;
    const { data: pickData, error: pickError } = await supabase
      .from("draft_picks")
      .insert({
        draft_lobby_id: id,
        player_id: body.playerId,
        team: draft.current_pick_team,
        pick_number: pickNumber,
        picked_by: picker.id
      })
      .select("*")
      .single();

    const pick = assertSupabase(pickData, pickError);

    await supabase
      .from("draft_lobbies")
      .update({ current_pick_team: oppositeTeam(draft.current_pick_team) })
      .eq("id", id);

    return NextResponse.json({ pick }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
