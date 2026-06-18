"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamSide } from "@/types/domain";

export function MatchResultActions({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingTeam, setPendingTeam] = useState<TeamSide | null>(null);

  async function submitWinner(winningTeam: TeamSide) {
    setPendingTeam(winningTeam);
    setMessage(null);

    const response = await fetch(`/api/matches/${matchId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winningTeam })
    });

    const payload = await response.json();
    setPendingTeam(null);

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to confirm result.");
      return;
    }

    setMessage(payload.finalized ? "Match finalized and ELO updated." : "Result submitted. Waiting on the other captain.");
    router.refresh();
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => submitWinner("blue")}
        disabled={pendingTeam !== null}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:cursor-wait disabled:bg-blue-300"
      >
        {pendingTeam === "blue" ? "Submitting..." : "Submit Blue Win"}
      </button>
      <button
        type="button"
        onClick={() => submitWinner("red")}
        disabled={pendingTeam !== null}
        className="w-full rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white disabled:cursor-wait disabled:bg-red-300"
      >
        {pendingTeam === "red" ? "Submitting..." : "Submit Red Win"}
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700 sm:col-span-2">{message}</p> : null}
    </div>
  );
}
