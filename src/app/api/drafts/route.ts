import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, assertSupabase } from "@/lib/api";
import { requireAdminPlayer } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const createDraftSchema = z.object({
  blueCaptainId: z.string().uuid(),
  redCaptainId: z.string().uuid()
});

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("draft_lobbies")
      .select("*, blue_captain:players!draft_lobbies_blue_captain_id_fkey(*), red_captain:players!draft_lobbies_red_captain_id_fkey(*)")
      .order("created_at", { ascending: false });

    return NextResponse.json({ drafts: assertSupabase(data, error) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminPlayer();
    const body = createDraftSchema.parse(await request.json());

    if (body.blueCaptainId === body.redCaptainId) {
      return NextResponse.json({ error: "Captains must be different players" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("draft_lobbies")
      .insert({
        created_by: admin.id,
        blue_captain_id: body.blueCaptainId,
        red_captain_id: body.redCaptainId,
        status: "drafting",
        current_pick_team: "blue"
      })
      .select("*")
      .single();

    return NextResponse.json({ draft: assertSupabase(data, error) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
