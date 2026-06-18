import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Player } from "@/types/domain";

export async function getCurrentPlayer(): Promise<Player | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data;
}

export async function requireCurrentPlayer() {
  const player = await getCurrentPlayer();

  if (!player) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return player;
}

export async function requireAdminPlayer() {
  const player = await requireCurrentPlayer();

  if (player.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return player;
}
