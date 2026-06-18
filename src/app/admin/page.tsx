import { PageHeader } from "@/components/page-header";
import { AdminCreateDraftForm } from "@/components/admin-create-draft-form";
import { getCurrentPlayer } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
const currentPlayer = await getCurrentPlayer();
const supabase = await createServerSupabaseClient();

const [{ data: players }, { data: drafts }, { data: matches }] =
await Promise.all([
supabase.from("players").select("*").order("username", { ascending: true }),
supabase
.from("draft_lobbies")
.select("*")
.order("created_at", { ascending: false })
.limit(5),
supabase
.from("matches")
.select("*")
.order("created_at", { ascending: false })
.limit(5)
]);

return ( <div> <PageHeader
     title="Admin Dashboard"
     description="Create draft lobbies, monitor match confirmations, and override disputed results."
   />

```
  {currentPlayer?.role !== "admin" ? (
    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
      You are viewing placeholders. Promote your Discord user to admin in Supabase to use protected API actions.
    </div>
  ) : null}

  <div className="grid gap-4 lg:grid-cols-3">
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
      <h2 className="text-lg font-black text-slate-950">
        Create Draft Lobby
      </h2>

      <AdminCreateDraftForm players={players ?? []} />
    </section>

    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">
        League Health
      </h2>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between rounded-md bg-slate-100 p-3">
          <span>Players</span>
          <strong>{players?.length ?? 0}</strong>
        </div>

        <div className="flex justify-between rounded-md bg-slate-100 p-3">
          <span>Recent drafts</span>
          <strong>{drafts?.length ?? 0}</strong>
        </div>

        <div className="flex justify-between rounded-md bg-slate-100 p-3">
          <span>Recent matches</span>
          <strong>{matches?.length ?? 0}</strong>
        </div>
      </div>
    </section>
  </div>
</div>
```

);
}
