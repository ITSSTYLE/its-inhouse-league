import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RosterPage() {
  const supabase = await createServerSupabaseClient();
  const { data: players } = await supabase.from("players").select("*").order("joined_at", { ascending: true });

  return (
    <div>
      <PageHeader
        title="League Roster"
        description="Every Discord member who has joined the in-house league, with their current record and join date."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(players ?? []).map((player) => (
          <article key={player.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {player.avatar_url ? (
                <Image src={player.avatar_url} alt="" width={48} height={48} className="rounded-full" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-black">
                  {player.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-slate-950">{player.username}</h2>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{player.role}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-slate-100 p-3">
                <dt className="text-xs text-slate-500">ELO</dt>
                <dd className="font-black">{player.elo}</dd>
              </div>
              <div className="rounded-md bg-slate-100 p-3">
                <dt className="text-xs text-slate-500">Wins</dt>
                <dd className="font-black">{player.wins}</dd>
              </div>
              <div className="rounded-md bg-slate-100 p-3">
                <dt className="text-xs text-slate-500">Games</dt>
                <dd className="font-black">{player.games_played}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
