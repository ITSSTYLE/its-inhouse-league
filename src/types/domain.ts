import type { Database } from "./database";

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type DraftLobby = Database["public"]["Tables"]["draft_lobbies"]["Row"];
export type DraftPick = Database["public"]["Tables"]["draft_picks"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type MatchPlayer = Database["public"]["Tables"]["match_players"]["Row"];
export type MatchConfirmation = Database["public"]["Tables"]["match_confirmations"]["Row"];
export type TeamSide = Database["public"]["Enums"]["team_side"];
