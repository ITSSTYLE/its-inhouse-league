import { Trophy, Users, Swords, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { getCurrentPlayer } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const player = await getCurrentPlayer();
  const supabase = await createServerSupabaseClient();

  const [{ count: playerCount }, { count: matchCount }, { data: topPlayers }] =
    await Promise.all([
      supabase.from("players").select("id", { count: "exact", head: true }),
      supabase.from("matches").select("id", { count: "exact", head: true }),
      supabase
        .from("players")
        .select("id, username, elo, wins, losses, avatar_url")
        .order("elo", { ascending: false })
        .limit(3)
    ]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
                Discord Community League
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                iT&apos;s In-House League
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200">
                Draft balanced teams, confirm match results, and keep every player&apos;s ELO moving in one mobile-friendly league hub.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={player ? "/drafts" : "/api/auth/login"}
                className="inline-flex items-center justify-center rounded-md bg-discord px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4752c4]"
              >
                {player ? "Open Drafts" : "Login with Discord"}
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center rounded-md border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-100">
              <Trophy className="h-4 w-4" />
              Current Top Players
            </div>
            <div className="space-y-3">
              {(topPlayers ?? []).map((topPlayer, index) => (
                <div
                  key={topPlayer.id}
                  className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold">
                      #{index + 1} {topPlayer.username}
                    </p>
                    <p className="text-xs text-slate-300">
                      {topPlayer.wins}W / {topPlayer.losses}L
                    </p>
                  </div>
                  <span className="text-lg font-black">{topPlayer.elo}</span>
                </div>
              ))}
              {topPlayers?.length === 0 ? (
                <p className="rounded-md bg-white/10 px-4 py-3 text-sm text-slate-300">
                  Login with Discord to seed the first roster spot.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Players" value={playerCount ?? 0} />
        <StatCard icon={Swords} label="Matches" value={matchCount ?? 0} />
        <StatCard icon={Trophy} label="Starting ELO" value={1000} />
        <StatCard icon={ShieldCheck} label="Confirmations" value="2 captains" />
      </section>
    </div>
  );
}
