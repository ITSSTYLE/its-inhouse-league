export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          auth_user_id: string | null;
          discord_id: string;
          username: string;
          avatar_url: string | null;
          joined_at: string;
          elo: number;
          wins: number;
          losses: number;
          games_played: number;
          role: "player" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          discord_id: string;
          username: string;
          avatar_url?: string | null;
          joined_at?: string;
          elo?: number;
          wins?: number;
          losses?: number;
          games_played?: number;
          role?: "player" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          discord_id?: string;
          username?: string;
          avatar_url?: string | null;
          joined_at?: string;
          elo?: number;
          wins?: number;
          losses?: number;
          games_played?: number;
          role?: "player" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      draft_lobbies: {
        Row: {
          id: string;
          created_by: string;
          blue_captain_id: string;
          red_captain_id: string;
          status: "open" | "drafting" | "complete" | "cancelled";
          current_pick_team: "blue" | "red";
          locked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          blue_captain_id: string;
          red_captain_id: string;
          status?: "open" | "drafting" | "complete" | "cancelled";
          current_pick_team?: "blue" | "red";
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          blue_captain_id?: string;
          red_captain_id?: string;
          status?: "open" | "drafting" | "complete" | "cancelled";
          current_pick_team?: "blue" | "red";
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "draft_lobbies_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_lobbies_blue_captain_id_fkey";
            columns: ["blue_captain_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_lobbies_red_captain_id_fkey";
            columns: ["red_captain_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      draft_picks: {
        Row: {
          id: string;
          draft_lobby_id: string;
          player_id: string;
          team: "blue" | "red";
          pick_number: number;
          picked_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          draft_lobby_id: string;
          player_id: string;
          team: "blue" | "red";
          pick_number: number;
          picked_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          draft_lobby_id?: string;
          player_id?: string;
          team?: "blue" | "red";
          pick_number?: number;
          picked_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "draft_picks_draft_lobby_id_fkey";
            columns: ["draft_lobby_id"];
            isOneToOne: false;
            referencedRelation: "draft_lobbies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_picks_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_picks_picked_by_fkey";
            columns: ["picked_by"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          draft_lobby_id: string | null;
          blue_captain_id: string;
          red_captain_id: string;
          winning_team: "blue" | "red" | null;
          status: "pending_confirmation" | "confirmed" | "overridden" | "cancelled";
          created_by: string;
          confirmed_at: string | null;
          overridden_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          draft_lobby_id?: string | null;
          blue_captain_id: string;
          red_captain_id: string;
          winning_team?: "blue" | "red" | null;
          status?: "pending_confirmation" | "confirmed" | "overridden" | "cancelled";
          created_by: string;
          confirmed_at?: string | null;
          overridden_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          draft_lobby_id?: string | null;
          blue_captain_id?: string;
          red_captain_id?: string;
          winning_team?: "blue" | "red" | null;
          status?: "pending_confirmation" | "confirmed" | "overridden" | "cancelled";
          created_by?: string;
          confirmed_at?: string | null;
          overridden_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_draft_lobby_id_fkey";
            columns: ["draft_lobby_id"];
            isOneToOne: true;
            referencedRelation: "draft_lobbies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_blue_captain_id_fkey";
            columns: ["blue_captain_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_red_captain_id_fkey";
            columns: ["red_captain_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_overridden_by_fkey";
            columns: ["overridden_by"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      match_players: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          team: "blue" | "red";
          elo_before: number;
          elo_after: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          team: "blue" | "red";
          elo_before?: number;
          elo_after?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          team?: "blue" | "red";
          elo_before?: number;
          elo_after?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
      match_confirmations: {
        Row: {
          id: string;
          match_id: string;
          captain_id: string;
          winning_team: "blue" | "red";
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          captain_id: string;
          winning_team: "blue" | "red";
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          captain_id?: string;
          winning_team?: "blue" | "red";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_confirmations_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_confirmations_captain_id_fkey";
            columns: ["captain_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_match_result: {
        Args: { target_match_id: string };
        Returns: undefined;
      };
      current_player_id: {
        Args: never;
        Returns: string;
      };
      is_admin: {
        Args: never;
        Returns: boolean;
      };
    };
    Enums: {
      player_role: "player" | "admin";
      draft_status: "open" | "drafting" | "complete" | "cancelled";
      team_side: "blue" | "red";
      match_status: "pending_confirmation" | "confirmed" | "overridden" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
