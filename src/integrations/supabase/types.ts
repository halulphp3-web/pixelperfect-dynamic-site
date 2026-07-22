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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean
          subject?: string | null
        }
        Relationships: []
      }
      features: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          active: boolean
          created_at: string
          cta_label: string | null
          cta_url: string | null
          heading: string
          id: string
          image_url: string | null
          sort: number
          subheading: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          heading: string
          id?: string
          image_url?: string | null
          sort?: number
          subheading?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          heading?: string
          id?: string
          image_url?: string | null
          sort?: number
          subheading?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          id: string
          mime: string | null
          path: string
          size: number | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime?: string | null
          path: string
          size?: number | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime?: string | null
          path?: string
          size?: number | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          location: string
          sort: number
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          location?: string
          sort?: number
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          location?: string
          sort?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          seo: Json
          slug: string
          sort: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          seo?: Json
          slug: string
          sort?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          seo?: Json
          slug?: string
          sort?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          seo: Json
          slug: string
          sort: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          seo?: Json
          slug: string
          sort?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          seo?: Json
          slug?: string
          sort?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          email: string | null
          favicon_url: string | null
          google_map_embed: string | null
          id: number
          logo_url: string | null
          phone: string | null
          scripts: Json
          seo: Json
          site_name: string
          socials: Json
          tagline: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          email?: string | null
          favicon_url?: string | null
          google_map_embed?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          scripts?: Json
          seo?: Json
          site_name?: string
          socials?: Json
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          email?: string | null
          favicon_url?: string | null
          google_map_embed?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          scripts?: Json
          seo?: Json
          site_name?: string
          socials?: Json
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          active: boolean
          created_at: string
          icon: string | null
          id: string
          label: string
          sort: number
          suffix: string | null
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          sort?: number
          suffix?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          sort?: number
          suffix?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          quote: string
          rating: number | null
          role: string | null
          sort: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          quote: string
          rating?: number | null
          role?: string | null
          sort?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          quote?: string
          rating?: number | null
          role?: string | null
          sort?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
