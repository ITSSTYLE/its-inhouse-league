import { PageHeader } from "@/components/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("elo", { ascending: false })
    .order("wins", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Players start at 1000 ELO. Confirmed match results update ELO, wins, losses, and games played."
      />
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[56px_1fr_80px_80px] gap-3 border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 sm:grid-cols-[72px_1fr_100px_100px_100px]">
          <span>Rank</span>
          <span>Player</span>
          <span>ELO</span>
          <span>W-L</span>
          <span className="hidden sm:block">Games</span>
        </div>
        {(players ?? []).map((player, index) => (
          <div
            key={player.id}
            className="grid grid-cols-[56px_1fr_80px_80px] gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 sm:grid-cols-[72px_1fr_100px_100px_100px]"
          >
            <span className="font-black text-slate-500">#{index + 1}</span>
            <span className="min-w-0 truncate font-bold text-slate-950">{player.username}</span>
            <span className="font-black">{player.elo}</span>
            <span>{player.wins}-{player.losses}</span>
            <span className="hidden sm:block">{player.games_played}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
