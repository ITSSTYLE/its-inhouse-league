import type { TeamSide } from "@/types/domain";

export function oppositeTeam(team: TeamSide): TeamSide {
  return team === "blue" ? "red" : "blue";
}

export function isCaptainForTeam({
  playerId,
  team,
  blueCaptainId,
  redCaptainId
}: {
  playerId: string;
  team: TeamSide;
  blueCaptainId: string;
  redCaptainId: string;
}) {
  return team === "blue" ? playerId === blueCaptainId : playerId === redCaptainId;
}
