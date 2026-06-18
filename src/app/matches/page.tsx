import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MatchesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: matches } = await supabase
    .from("matches")
    .select("*, blue_captain:players!matches_blue_captain_id_fkey(username), red_captain:players!matches_red_captain_id_fkey(username), match_players(*, player:players(username)), match_confirmations(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Match History"
        description="Track draft-created matches, captain confirmations, confirmed winners, and admin overrides."
      />
      <div className="space-y-3">
        {(matches ?? []).map((match) => (
          <article key={match.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-black text-slate-950">
                  Blue vs Red
                </h2>
                <p className="text-sm text-slate-600">
                  {match.blue_captain?.username ?? "Blue captain"} vs {match.red_captain?.username ?? "Red captain"}
                </p>
              </div>
              <span className="inline-flex w-fit rounded-md bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
                {match.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-blue-50 p-3 text-sm">
                <p className="font-black text-blue-800">Blue Team</p>
                <p className="mt-1 text-blue-700">
                  {match.match_players?.filter((item) => item.team === "blue").length ?? 0} players
                </p>
              </div>
              <div className="rounded-md bg-red-50 p-3 text-sm">
                <p className="font-black text-red-800">Red Team</p>
                <p className="mt-1 text-red-700">
                  {match.match_players?.filter((item) => item.team === "red").length ?? 0} players
                </p>
              </div>
              <div className="rounded-md bg-slate-100 p-3 text-sm">
                <p className="font-black text-slate-800">Winner</p>
                <p className="mt-1 capitalize text-slate-700">{match.winning_team ?? "Pending"}</p>
              </div>
            </div>
            {match.status === "pending_confirmation" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/matches/${match.id}`} className="rounded-md bg-ink px-3 py-2 text-xs font-bold text-white">
                  Confirm Result
                </Link>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
