import { PageHeader } from "@/components/page-header";
import { MatchResultActions } from "@/components/match-result-actions";

export default async function MatchConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageHeader
        title="Confirm Match Result"
        description="Captains submit the winner here. When both captains agree, the match finalizes and player ELO updates."
      />
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">Match ID</p>
        <p className="mt-1 break-all font-mono text-sm font-bold text-slate-950">{id}</p>
        <MatchResultActions matchId={id} />
      </div>
    </div>
  );
}
