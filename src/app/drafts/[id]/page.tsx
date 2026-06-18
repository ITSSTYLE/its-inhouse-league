import { PageHeader } from "@/components/page-header";
import { DraftActions } from "@/components/draft-actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DraftLobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: draft }, { data: picks }, { data: players }] = await Promise.all([
    supabase
      .from("draft_lobbies")
      .select("*, blue_captain:players!draft_lobbies_blue_captain_id_fkey(*), red_captain:players!draft_lobbies_red_captain_id_fkey(*)")
      .eq("id", id)
      .single(),
    supabase
      .from("draft_picks")
      .select("*, player:players!draft_picks_player_id_fkey(*)")
      .eq("draft_lobby_id", id)
      .order("pick_number", { ascending: true }),
    supabase.from("players").select("*").order("elo", { ascending: false })
  ]);

  const pickedIds = new Set((picks ?? []).map((pick) => pick.player_id));
  if (draft?.blue_captain_id) pickedIds.add(draft.blue_captain_id);
  if (draft?.red_captain_id) pickedIds.add(draft.red_captain_id);
  const availablePlayers = (players ?? []).filter((player) => !pickedIds.has(player.id));

  return (
    <div>
      <PageHeader
        title="Draft Lobby"
        description="Captains alternate picks from the available player pool. Lock the lobby when teams are ready."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
        <section className="rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
          <h2 className="font-black text-blue-800">Blue Team</h2>
          <p className="mt-1 text-sm text-slate-600">Captain: {draft?.blue_captain?.username ?? "Unassigned"}</p>
          <div className="mt-4 space-y-2">
            {(picks ?? []).filter((pick) => pick.team === "blue").map((pick) => (
              <div key={pick.id} className="rounded-md bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">
                #{pick.pick_number} {pick.player?.username}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-red-200 bg-white p-4 shadow-sm">
          <h2 className="font-black text-red-800">Red Team</h2>
          <p className="mt-1 text-sm text-slate-600">Captain: {draft?.red_captain?.username ?? "Unassigned"}</p>
          <div className="mt-4 space-y-2">
            {(picks ?? []).filter((pick) => pick.team === "red").map((pick) => (
              <div key={pick.id} className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-900">
                #{pick.pick_number} {pick.player?.username}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black text-slate-950">Available</h2>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black uppercase text-slate-600">
              {draft?.current_pick_team} pick
            </span>
          </div>
          <div className="mt-4 max-h-[460px] space-y-2 overflow-auto pr-1">
            <DraftActions
              draftId={id}
              availablePlayers={availablePlayers}
              canLock={(picks?.length ?? 0) > 0 && draft?.status === "drafting"}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
