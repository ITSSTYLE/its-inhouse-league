import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DraftsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: drafts } = await supabase
    .from("draft_lobbies")
    .select("*, blue_captain:players!draft_lobbies_blue_captain_id_fkey(username), red_captain:players!draft_lobbies_red_captain_id_fkey(username), draft_picks(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Draft Lobbies"
        description="Admins create lobbies, assign two captains, and captains alternate picks until the teams lock."
        action={
          <Link href="/admin" className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-white">
            Create Lobby
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {(drafts ?? []).map((draft) => (
          <Link
            href={`/drafts/${draft.id}`}
            key={draft.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-950">
                  {draft.blue_captain?.username ?? "Blue captain"} vs {draft.red_captain?.username ?? "Red captain"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Next pick: <span className="font-bold capitalize">{draft.current_pick_team}</span>
                </p>
              </div>
              <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
                {draft.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{draft.draft_picks?.length ?? 0} drafted players</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
