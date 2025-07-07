export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          active: boolean | null
          bye_week: number | null
          created_at: string
          id: string
          metadata: Json | null
          name: string
          player_id: string
          position: string
          team: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          bye_week?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          player_id: string
          position: string
          team: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          bye_week?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          player_id?: string
          position?: string
          team?: string
          updated_at?: string
        }
        Relationships: []
      }
      projections: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          player_id: string | null
          projected_points: number
          projection_type: string
          season: number
          week: number
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          player_id?: string | null
          projected_points: number
          projection_type: string
          season: number
          week: number
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          player_id?: string | null
          projected_points?: number
          projection_type?: string
          season?: number
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "projections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_status: {
        Row: {
          created_at: string
          error_count: number | null
          error_details: string | null
          id: string
          last_sync_at: string
          players_processed: number | null
          retired_players: number | null
          success: boolean
          sync_type: string
          team_changes: number | null
        }
        Insert: {
          created_at?: string
          error_count?: number | null
          error_details?: string | null
          id?: string
          last_sync_at?: string
          players_processed?: number | null
          retired_players?: number | null
          success?: boolean
          sync_type: string
          team_changes?: number | null
        }
        Update: {
          created_at?: string
          error_count?: number | null
          error_details?: string | null
          id?: string
          last_sync_at?: string
          players_processed?: number | null
          retired_players?: number | null
          success?: boolean
          sync_type?: string
          team_changes?: number | null
        }
        Relationships: []
      }
      trade_values: {
        Row: {
          created_at: string
          id: string
          player_id: string | null
          season: number
          tier: number | null
          trade_value: number
          week: number
        }
        Insert: {
          created_at?: string
          id?: string
          player_id?: string | null
          season: number
          tier?: number | null
          trade_value: number
          week: number
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string | null
          season?: number
          tier?: number | null
          trade_value?: number
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_values_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rankings_players: {
        Row: {
          created_at: string
          notes: string | null
          overall_rank: number | null
          player_id: string
          ranking_set_id: string
          tier: number | null
        }
        Insert: {
          created_at?: string
          notes?: string | null
          overall_rank?: number | null
          player_id: string
          ranking_set_id: string
          tier?: number | null
        }
        Update: {
          created_at?: string
          notes?: string | null
          overall_rank?: number | null
          player_id?: string
          ranking_set_id?: string
          tier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rankings_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rankings_players_ranking_set_id_fkey"
            columns: ["ranking_set_id"]
            isOneToOne: false
            referencedRelation: "user_rankings_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rankings_sets: {
        Row: {
          created_at: string
          format: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          format: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_teams: {
        Row: {
          created_at: string
          id: string
          league_id: string | null
          platform: string | null
          team_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          league_id?: string | null
          platform?: string | null
          team_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string | null
          platform?: string | null
          team_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_stats: {
        Row: {
          created_at: string
          fantasy_points: number | null
          fumbles_lost: number | null
          id: string
          passing_interceptions: number | null
          passing_tds: number | null
          passing_yards: number | null
          player_id: string | null
          receiving_tds: number | null
          receiving_yards: number | null
          receptions: number | null
          rushing_tds: number | null
          rushing_yards: number | null
          season: number
          week: number
        }
        Insert: {
          created_at?: string
          fantasy_points?: number | null
          fumbles_lost?: number | null
          id?: string
          passing_interceptions?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_id?: string | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season: number
          week: number
        }
        Update: {
          created_at?: string
          fantasy_points?: number | null
          fumbles_lost?: number | null
          id?: string
          passing_interceptions?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_id?: string | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season?: number
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_ranking_sets_for_user: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      log_sync_status: {
        Args: {
          sync_type: string
          success: boolean
          players_processed?: number
          team_changes?: number
          retired_players?: number
          error_count?: number
          error_details?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
