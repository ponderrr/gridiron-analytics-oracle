export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      draft_picks: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          pick_type: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          pick_type: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          pick_type?: string
          year?: number
        }
        Relationships: []
      }
      etl_metadata: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_created_timestamp: number | null
          last_run: string
          last_season: number | null
          last_week: number | null
          records_processed: number | null
          run_type: string
          status: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_created_timestamp?: number | null
          last_run?: string
          last_season?: number | null
          last_week?: number | null
          records_processed?: number | null
          run_type: string
          status?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_created_timestamp?: number | null
          last_run?: string
          last_season?: number | null
          last_week?: number | null
          records_processed?: number | null
          run_type?: string
          status?: string | null
        }
        Relationships: []
      }
      mapping_audit: {
        Row: {
          action: string
          id: string
          mapping_id: string | null
          new_values: Json | null
          notes: string | null
          old_values: Json | null
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          id?: string
          mapping_id?: string | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          id?: string
          mapping_id?: string | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mapping_audit_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "player_id_mapping"
            referencedColumns: ["id"]
          },
        ]
      }
      player_id_mapping: {
        Row: {
          alternate_names: string[] | null
          canonical_name: string
          confidence_score: number | null
          created_at: string | null
          id: string
          match_method: string
          nflverse_id: string
          notes: string | null
          position: string | null
          sleeper_id: string
          team: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          alternate_names?: string[] | null
          canonical_name: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          match_method: string
          nflverse_id: string
          notes?: string | null
          position?: string | null
          sleeper_id: string
          team?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          alternate_names?: string[] | null
          canonical_name?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          match_method?: string
          nflverse_id?: string
          notes?: string | null
          position?: string | null
          sleeper_id?: string
          team?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
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
      query_performance_log: {
        Row: {
          created_at: string | null
          execution_time_ms: number
          id: string
          query_hash: string | null
          query_type: string
          rows_affected: number | null
        }
        Insert: {
          created_at?: string | null
          execution_time_ms: number
          id?: string
          query_hash?: string | null
          query_type: string
          rows_affected?: number | null
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number
          id?: string
          query_hash?: string | null
          query_type?: string
          rows_affected?: number | null
        }
        Relationships: []
      }
      sleeper_drafts: {
        Row: {
          created: number
          created_at: string
          draft_id: string
          season: number
          season_type: string
          type: string
        }
        Insert: {
          created: number
          created_at?: string
          draft_id: string
          season: number
          season_type?: string
          type: string
        }
        Update: {
          created?: number
          created_at?: string
          draft_id?: string
          season?: number
          season_type?: string
          type?: string
        }
        Relationships: []
      }
      sleeper_picks: {
        Row: {
          created_at: string
          draft_id: string
          pick_no: number
          player_id: string
        }
        Insert: {
          created_at?: string
          draft_id: string
          pick_no: number
          player_id: string
        }
        Update: {
          created_at?: string
          draft_id?: string
          pick_no?: number
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleeper_picks_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "sleeper_drafts"
            referencedColumns: ["draft_id"]
          },
        ]
      }
      sleeper_players_cache: {
        Row: {
          bye_week: number | null
          full_name: string
          last_updated: string
          player_id: string
          position: string | null
          team: string | null
        }
        Insert: {
          bye_week?: number | null
          full_name: string
          last_updated?: string
          player_id: string
          position?: string | null
          team?: string | null
        }
        Update: {
          bye_week?: number | null
          full_name?: string
          last_updated?: string
          player_id?: string
          position?: string | null
          team?: string | null
        }
        Relationships: []
      }
      sleeper_stats: {
        Row: {
          created_at: string
          pass_td: number | null
          pass_yd: number | null
          player_id: string
          pts_ppr: number | null
          rec_td: number | null
          rec_yd: number | null
          rush_yd: number | null
          season: number
          week: number
        }
        Insert: {
          created_at?: string
          pass_td?: number | null
          pass_yd?: number | null
          player_id: string
          pts_ppr?: number | null
          rec_td?: number | null
          rec_yd?: number | null
          rush_yd?: number | null
          season: number
          week: number
        }
        Update: {
          created_at?: string
          pass_td?: number | null
          pass_yd?: number | null
          player_id?: string
          pts_ppr?: number | null
          rec_td?: number | null
          rec_yd?: number | null
          rush_yd?: number | null
          season?: number
          week?: number
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          api_errors: number | null
          completed_at: string | null
          created_at: string
          database_errors: number | null
          duration_ms: number | null
          error_details: Json | null
          id: string
          performance_metrics: Json | null
          processed_records: number | null
          started_at: string
          success: boolean
          sync_type: string
          total_records: number | null
          validation_errors: number | null
          validation_stats: Json | null
        }
        Insert: {
          api_errors?: number | null
          completed_at?: string | null
          created_at?: string
          database_errors?: number | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          performance_metrics?: Json | null
          processed_records?: number | null
          started_at?: string
          success?: boolean
          sync_type: string
          total_records?: number | null
          validation_errors?: number | null
          validation_stats?: Json | null
        }
        Update: {
          api_errors?: number | null
          completed_at?: string | null
          created_at?: string
          database_errors?: number | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          performance_metrics?: Json | null
          processed_records?: number | null
          started_at?: string
          success?: boolean
          sync_type?: string
          total_records?: number | null
          validation_errors?: number | null
          validation_stats?: Json | null
        }
        Relationships: []
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
      top_players_pool: {
        Row: {
          consensus_rank: number | null
          created_at: string | null
          format: string | null
          is_active: boolean | null
          player_data: Json | null
          season: number | null
          week: number | null
        }
        Insert: {
          consensus_rank?: number | null
          created_at?: string | null
          format?: string | null
          is_active?: boolean | null
          player_data?: Json | null
          season?: number | null
          week?: number | null
        }
        Update: {
          consensus_rank?: number | null
          created_at?: string | null
          format?: string | null
          is_active?: boolean | null
          player_data?: Json | null
          season?: number | null
          week?: number | null
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
      unmapped_players: {
        Row: {
          attempts_count: number | null
          first_seen: string | null
          id: string
          last_attempt: string | null
          notes: string | null
          player_id: string
          player_name: string
          position: string | null
          source: string
          team: string | null
        }
        Insert: {
          attempts_count?: number | null
          first_seen?: string | null
          id?: string
          last_attempt?: string | null
          notes?: string | null
          player_id: string
          player_name: string
          position?: string | null
          source: string
          team?: string | null
        }
        Update: {
          attempts_count?: number | null
          first_seen?: string | null
          id?: string
          last_attempt?: string | null
          notes?: string | null
          player_id?: string
          player_name?: string
          position?: string | null
          source?: string
          team?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_rankings_players: {
        Row: {
          created_at: string
          notes: string | null
          overall_rank: number | null
          pick_id: string | null
          player_id: string
          pool_season: number | null
          pool_week: number | null
          ranking_set_id: string
          tier: number | null
        }
        Insert: {
          created_at?: string
          notes?: string | null
          overall_rank?: number | null
          pick_id?: string | null
          player_id: string
          pool_season?: number | null
          pool_week?: number | null
          ranking_set_id: string
          tier?: number | null
        }
        Update: {
          created_at?: string
          notes?: string | null
          overall_rank?: number | null
          pick_id?: string | null
          player_id?: string
          pool_season?: number | null
          pool_week?: number | null
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
      top200_dynasty: {
        Row: {
          adp: number | null
          adp_stddev: number | null
          best_pick: number | null
          bye_week: number | null
          full_name: string | null
          player_id: string | null
          position: string | null
          samples: number | null
          team: string | null
          worst_pick: number | null
        }
        Relationships: []
      }
      top200_redraft: {
        Row: {
          adp: number | null
          adp_stddev: number | null
          best_pick: number | null
          bye_week: number | null
          full_name: string | null
          player_id: string | null
          position: string | null
          samples: number | null
          team: string | null
          worst_pick: number | null
        }
        Relationships: []
      }
      weekly_player_summary: {
        Row: {
          fantasy_finish: number | null
          full_name: string | null
          pass_td: number | null
          pass_yd: number | null
          player_id: string | null
          position: string | null
          pts_ppr: number | null
          rec_td: number | null
          rec_yd: number | null
          rush_yd: number | null
          season: number | null
          team: string | null
          total_players_week: number | null
          week: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      alert_mapping_failures: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      check_mapping_quality: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_name: string
          metric_value: number
          threshold: number
          status: string
        }[]
      }
      clean_old_etl_metadata: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_default_ranking_sets_for_user: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      data_quality_checks: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          issue_count: number
          severity: string
          description: string
        }[]
      }
      deactivate_old_pools: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_draft_picks_for_year: {
        Args: { pick_year: number }
        Returns: {
          id: string
          year: number
          pick_type: string
          display_name: string
          description: string
        }[]
      }
      get_last_refresh: {
        Args: { run_type_param: string }
        Returns: number
      }
      get_last_stats_refresh: {
        Args: Record<PropertyKey, never>
        Returns: {
          last_season: number
          last_week: number
        }[]
      }
      get_latest_player_pool: {
        Args: { format_type: string }
        Returns: {
          week: number
          season: number
          format: string
          player_data: Json
          consensus_rank: number
        }[]
      }
      log_sync_operation: {
        Args: {
          sync_type: string
          total_records?: number
          processed_records?: number
          validation_errors?: number
          database_errors?: number
          api_errors?: number
          duration_ms?: number
          error_details?: Json
          validation_stats?: Json
          performance_metrics?: Json
        }
        Returns: string
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
      mapping_performance_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_name: string
          current_value: number
          target_value: number
          status: string
        }[]
      }
      monthly_mapping_trends: {
        Args: Record<PropertyKey, never>
        Returns: {
          month_year: string
          new_mappings: number
          avg_confidence: number
          manual_reviews: number
          sync_failures: number
        }[]
      }
      refresh_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      weekly_mapping_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          report_date: string
          total_mappings: number
          new_mappings_this_week: number
          unmapped_players: number
          low_confidence_mappings: number
          sync_success_rate: number
          avg_confidence_score: number
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
