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
      actions: {
        Row: {
          archived: boolean | null
          caption: string | null
          category: string
          color: string
          created_at: string
          date: string
          description: string | null
          files: string[] | null
          id: string
          instagram_date: string
          partners: string[]
          priority: string
          responsibles: string[]
          state: string
          time: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          caption?: string | null
          category: string
          color?: string
          created_at: string
          date: string
          description?: string | null
          files?: string[] | null
          id?: string
          instagram_date: string
          partners: string[]
          priority: string
          responsibles: string[]
          state: string
          time?: number
          title: string
          updated_at: string
          user_id?: string
        }
        Update: {
          archived?: boolean | null
          caption?: string | null
          category?: string
          color?: string
          created_at?: string
          date?: string
          description?: string | null
          files?: string[] | null
          id?: string
          instagram_date?: string
          partners?: string[]
          priority?: string
          responsibles?: string[]
          state?: string
          time?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          created_at: string
          id: string
          order: number
          role: number
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order: number
          role?: number
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          order?: number
          role?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          area: string
          color: string
          created_at: string
          id: string
          order: number
          shortcut: string
          slug: string
          title: string
        }
        Insert: {
          area: string
          color?: string
          created_at?: string
          id?: string
          order: number
          shortcut?: string
          slug: string
          title: string
        }
        Update: {
          area?: string
          color?: string
          created_at?: string
          id?: string
          order?: number
          shortcut?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      celebrations: {
        Row: {
          created_at: string
          date: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      config: {
        Row: {
          account: string | null
          adm: string | null
          created_at: string
          creative: string | null
          id: number
        }
        Insert: {
          account?: string | null
          adm?: string | null
          created_at?: string
          creative?: string | null
          id?: number
        }
        Update: {
          account?: string | null
          adm?: string | null
          created_at?: string
          creative?: string | null
          id?: number
        }
        Relationships: []
      }
      particulars: {
        Row: {
          action_id: string | null
          created_at: string
          description: string
          id: number
        }
        Insert: {
          action_id?: string | null
          created_at?: string
          description: string
          id?: number
        }
        Update: {
          action_id?: string | null
          created_at?: string
          description?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "particulars_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          archived: boolean
          colors: string[]
          context: string | null
          created_at: string
          id: string
          img: string | null
          short: string
          slug: string
          sow: Database["public"]["Enums"]["sow"]
          title: string
          users_ids: string[]
        }
        Insert: {
          archived?: boolean
          colors: string[]
          context?: string | null
          created_at?: string
          id?: string
          img?: string | null
          short: string
          slug: string
          sow?: Database["public"]["Enums"]["sow"]
          title: string
          users_ids: string[]
        }
        Update: {
          archived?: boolean
          colors?: string[]
          context?: string | null
          created_at?: string
          id?: string
          img?: string | null
          short?: string
          slug?: string
          sow?: Database["public"]["Enums"]["sow"]
          title?: string
          users_ids?: string[]
        }
        Relationships: []
      }
      people: {
        Row: {
          admin: boolean
          areas: string[]
          created_at: string
          email: string | null
          id: string
          image: string | null
          initials: string
          name: string
          role: number
          short: string
          surname: string
          user_id: string
        }
        Insert: {
          admin?: boolean
          areas: string[]
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          initials: string
          name: string
          role?: number
          short: string
          surname: string
          user_id: string
        }
        Update: {
          admin?: boolean
          areas?: string[]
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          initials?: string
          name?: string
          role?: number
          short?: string
          surname?: string
          user_id?: string
        }
        Relationships: []
      }
      priorities: {
        Row: {
          created_at: string
          id: string
          order: number
          shortcut: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order: number
          shortcut?: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          order?: number
          shortcut?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      sprints: {
        Row: {
          action_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          color: string
          created_at: string
          id: string
          order: number
          shortcut: string
          slug: string
          title: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          order: number
          shortcut?: string
          slug: string
          title: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          order?: number
          shortcut?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sow: "marketing" | "socialmedia" | "demand"
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
    Enums: {
      sow: ["marketing", "socialmedia", "demand"],
    },
  },
} as const
