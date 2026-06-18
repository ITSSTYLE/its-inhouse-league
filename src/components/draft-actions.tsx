"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Player } from "@/types/domain";

export function DraftActions({
  draftId,
  availablePlayers,
  canLock
}: {
  draftId: string;
  availablePlayers: Player[];
  canLock: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busyPlayerId, setBusyPlayerId] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  async function pickPlayer(playerId: string) {
    setBusyPlayerId(playerId);
    setMessage(null);

    const response = await fetch(`/api/drafts/${draftId}/pick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId })
    });

    const payload = await response.json();
    setBusyPlayerId(null);

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to draft player.");
      return;
    }

    router.refresh();
  }

  async function lockDraft() {
    setIsLocking(true);
    setMessage(null);

    const response = await fetch(`/api/drafts/${draftId}/lock`, { method: "POST" });
    const payload = await response.json();
    setIsLocking(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to lock draft.");
      return;
    }

    router.push(`/matches/${payload.match.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="max-h-[390px] space-y-2 overflow-auto pr-1">
        {availablePlayers.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => pickPlayer(player.id)}
            disabled={busyPlayerId === player.id}
            className="flex w-full items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-left text-sm transition hover:bg-slate-200 disabled:cursor-wait"
          >
            <span className="min-w-0 truncate font-bold">{player.username}</span>
            <span className="shrink-0 font-black">{busyPlayerId === player.id ? "..." : player.elo}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={lockDraft}
        disabled={!canLock || isLocking}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <Lock className="h-4 w-4" />
        {isLocking ? "Locking..." : "Lock Draft"}
      </button>
      {message ? <p className="text-sm font-semibold text-red-700">{message}</p> : null}
    </div>
  );
}
