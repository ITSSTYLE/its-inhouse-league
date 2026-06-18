"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Player } from "@/types/domain";

export function AdminCreateDraftForm({ players }: { players: Player[] }) {
  const router = useRouter();
  const [blueCaptainId, setBlueCaptainId] = useState(players[0]?.id ?? "");
  const [redCaptainId, setRedCaptainId] = useState(players[1]?.id ?? players[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = useMemo(
    () => Boolean(blueCaptainId && redCaptainId && blueCaptainId !== redCaptainId),
    [blueCaptainId, redCaptainId]
  );

  async function createDraft() {
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/drafts", {
  method: "POST",
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ blueCaptainId, redCaptainId })
});

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to create draft lobby.");
      return;
    }

    router.push(`/drafts/${payload.draft.id}`);
    router.refresh();
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-bold text-slate-700">
        Blue Captain
        <select
          value={blueCaptainId}
          onChange={(event) => setBlueCaptainId(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
        >
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.username}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-bold text-slate-700">
        Red Captain
        <select
          value={redCaptainId}
          onChange={(event) => setRedCaptainId(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
        >
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.username}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={!canSubmit || isSaving}
        onClick={createDraft}
        className="rounded-md bg-ink px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400 sm:col-span-2"
      >
        {isSaving ? "Creating..." : "Create Lobby"}
      </button>
      {message ? <p className="text-sm font-semibold text-red-700 sm:col-span-2">{message}</p> : null}
    </div>
  );
}
