export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      boards: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          slug?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      board_members: {
        Row: {
          board_id: string
          construct_name: string
          created_at: string
          display_order: number
          id: string
          identity_path: string
          is_chair: boolean
          retired_at: string | null
          seat: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          board_id: string
          construct_name: string
          created_at?: string
          display_order?: number
          id?: string
          identity_path: string
          is_chair?: boolean
          retired_at?: string | null
          seat: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          construct_name?: string
          created_at?: string
          display_order?: number
          id?: string
          identity_path?: string
          is_chair?: boolean
          retired_at?: string | null
          seat?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      council_reviews: {
        Row: {
          artifact_path: string
          board_id: string | null
          created_at: string
          epic_id: string | null
          human_decision: string | null
          human_decision_at: string | null
          id: string
          project_id: string | null
          rulings: Json | null
          synthesis: string | null
          tenant_id: string
          trigger: string
        }
        Insert: {
          artifact_path: string
          board_id?: string | null
          created_at?: string
          epic_id?: string | null
          human_decision?: string | null
          human_decision_at?: string | null
          id?: string
          project_id?: string | null
          rulings?: Json | null
          synthesis?: string | null
          tenant_id: string
          trigger: string
        }
        Update: {
          artifact_path?: string
          board_id?: string | null
          created_at?: string
          epic_id?: string | null
          human_decision?: string | null
          human_decision_at?: string | null
          id?: string
          project_id?: string | null
          rulings?: Json | null
          synthesis?: string | null
          tenant_id?: string
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "council_reviews_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "council_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "council_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatches: {
        Row: {
          attempt: number
          brief_path: string
          card_id: string | null
          closed_at: string | null
          dispatched_at: string
          id: string
          mode: string
          outcome: string | null
          performance_notes_path: string | null
          project_id: string
          team: Json | null
          tenant_id: string
        }
        Insert: {
          attempt?: number
          brief_path: string
          card_id?: string | null
          closed_at?: string | null
          dispatched_at?: string
          id?: string
          mode?: string
          outcome?: string | null
          performance_notes_path?: string | null
          project_id: string
          team?: Json | null
          tenant_id: string
        }
        Update: {
          attempt?: number
          brief_path?: string
          card_id?: string | null
          closed_at?: string | null
          dispatched_at?: string
          id?: string
          mode?: string
          outcome?: string | null
          performance_notes_path?: string | null
          project_id?: string
          team?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actor: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id: number
          occurred_at: string
          payload: Json | null
          tenant_id: string
        }
        Insert: {
          actor?: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: number
          occurred_at?: string
          payload?: Json | null
          tenant_id: string
        }
        Update: {
          actor?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: number
          occurred_at?: string
          payload?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_jds: {
        Row: {
          created_at: string
          hired_at: string | null
          hired_into_agent_id: string | null
          id: string
          jd_path: string
          project_id: string
          role_title: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          hired_at?: string | null
          hired_into_agent_id?: string | null
          id?: string
          jd_path: string
          project_id: string
          role_title: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          hired_at?: string | null
          hired_into_agent_id?: string | null
          id?: string
          jd_path?: string
          project_id?: string
          role_title?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_jds_hired_into_agent_id_fkey"
            columns: ["hired_into_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_jds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_jds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          archetype: string | null
          created_at: string
          ewma_score: number | null
          id: string
          identity_path: string
          is_promoted: boolean
          learnings_path: string | null
          name: string
          promoted_at: string | null
          promoted_by_user_id: string | null
          promoted_from_project_id: string | null
          proven_for: string[] | null
          retired_at: string | null
          role: string
          tenant_id: string
          updated_at: string
          wisdom_path: string | null
        }
        Insert: {
          archetype?: string | null
          created_at?: string
          ewma_score?: number | null
          id?: string
          identity_path: string
          is_promoted?: boolean
          learnings_path?: string | null
          name: string
          promoted_at?: string | null
          promoted_by_user_id?: string | null
          promoted_from_project_id?: string | null
          proven_for?: string[] | null
          retired_at?: string | null
          role: string
          tenant_id: string
          updated_at?: string
          wisdom_path?: string | null
        }
        Update: {
          archetype?: string | null
          created_at?: string
          ewma_score?: number | null
          id?: string
          identity_path?: string
          is_promoted?: boolean
          learnings_path?: string | null
          name?: string
          promoted_at?: string | null
          promoted_by_user_id?: string | null
          promoted_from_project_id?: string | null
          proven_for?: string[] | null
          retired_at?: string | null
          role?: string
          tenant_id?: string
          updated_at?: string
          wisdom_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_promoted_by_user_id_fkey"
            columns: ["promoted_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_promoted_from_project_id_fkey"
            columns: ["promoted_from_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          assigned_agent_id: string | null
          card_md_path: string
          closed_at: string | null
          created_at: string
          description: string | null
          dispatch_id: string | null
          epic_id: string
          id: string
          slug: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          card_md_path: string
          closed_at?: string | null
          created_at?: string
          description?: string | null
          dispatch_id?: string | null
          epic_id: string
          id?: string
          slug: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          card_md_path?: string
          closed_at?: string | null
          created_at?: string
          description?: string | null
          dispatch_id?: string | null
          epic_id?: string
          id?: string
          slug?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      epics: {
        Row: {
          closed_at: string | null
          council_review_id: string | null
          created_at: string
          epic_md_path: string
          id: string
          mission: string | null
          name: string
          slug: string
          sprint_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          council_review_id?: string | null
          created_at?: string
          epic_md_path: string
          id?: string
          mission?: string | null
          name: string
          slug: string
          sprint_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          council_review_id?: string | null
          created_at?: string
          epic_md_path?: string
          id?: string
          mission?: string | null
          name?: string
          slug?: string
          sprint_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "epics_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          approved_at: string | null
          archived_at: string | null
          created_at: string
          goals: Json | null
          id: string
          mission: string | null
          name: string
          planning_step: number
          project_md_path: string
          scope: string
          scoped_paths: string[] | null
          slug: string
          stack_context: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          archived_at?: string | null
          created_at?: string
          goals?: Json | null
          id?: string
          mission?: string | null
          name: string
          planning_step?: number
          project_md_path: string
          scope?: string
          scoped_paths?: string[] | null
          slug: string
          stack_context?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          archived_at?: string | null
          created_at?: string
          goals?: Json | null
          id?: string
          mission?: string | null
          name?: string
          planning_step?: number
          project_md_path?: string
          scope?: string
          scoped_paths?: string[] | null
          slug?: string
          stack_context?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          closed_at: string | null
          created_at: string
          ends_at: string | null
          goal: string | null
          id: string
          name: string
          project_id: string
          slug: string
          sprint_md_path: string
          starts_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          ends_at?: string | null
          goal?: string | null
          id?: string
          name: string
          project_id: string
          slug: string
          sprint_md_path: string
          starts_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          ends_at?: string | null
          goal?: string | null
          id?: string
          name?: string
          project_id?: string
          slug?: string
          sprint_md_path?: string
          starts_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          governance_level: string
          id: string
          name: string
          parent_tenant_id: string | null
          slug: string
          updated_at: string
          vault_path: string | null
        }
        Insert: {
          created_at?: string
          governance_level?: string
          id?: string
          name: string
          parent_tenant_id?: string | null
          slug: string
          updated_at?: string
          vault_path?: string | null
        }
        Update: {
          created_at?: string
          governance_level?: string
          id?: string
          name?: string
          parent_tenant_id?: string | null
          slug?: string
          updated_at?: string
          vault_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_parent_tenant_id_fkey"
            columns: ["parent_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_active: boolean
          role: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_active?: boolean
          role?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean
          role?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
      launch_project: {
        Args: {
          p_epics: Json
          p_project_id: string
          p_sprint_ends_at: string | null
          p_sprint_goal: string
          p_sprint_md_path: string
          p_sprint_name: string
          p_sprint_slug: string
          p_sprint_starts_at: string | null
          p_tenant_id: string
        }
        Returns: string
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
