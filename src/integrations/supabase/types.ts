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
      cart_items: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message: string | null
          last_message_time: string | null
          product_id: string
          product_image: string | null
          product_name: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          product_id: string
          product_image?: string | null
          product_name: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          product_id?: string
          product_image?: string | null
          product_name?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address: string | null
          category: string | null
          condition: string | null
          created_at: string
          delivery_fee: number | null
          delivery_service: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          discount_price: number
          expiry_days: number | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          max_quantity: number | null
          name: string
          original_price: number
          price_per_unit: number | null
          pricing_type: string
          reason: string | null
          seller_name: string | null
          status: Database["public"]["Enums"]["listing_status"]
          stock_quantity: number
          unit_type: string
          updated_at: string
          user_id: string
          weight: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_service?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount_price: number
          expiry_days?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          max_quantity?: number | null
          name: string
          original_price: number
          price_per_unit?: number | null
          pricing_type?: string
          reason?: string | null
          seller_name?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          stock_quantity?: number
          unit_type?: string
          updated_at?: string
          user_id: string
          weight?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string
          delivery_fee?: number | null
          delivery_service?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount_price?: number
          expiry_days?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          max_quantity?: number | null
          name?: string
          original_price?: number
          price_per_unit?: number | null
          pricing_type?: string
          reason?: string | null
          seller_name?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          stock_quantity?: number
          unit_type?: string
          updated_at?: string
          user_id?: string
          weight?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          message: string
          message_type: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          message: string
          message_type?: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          message?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          address: string | null
          created_at: string
          delivery_service: string | null
          delivery_type: string | null
          id: string
          latitude: number | null
          listing_id: string
          longitude: number | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          delivery_service?: string | null
          delivery_type?: string | null
          id?: string
          latitude?: number | null
          listing_id: string
          longitude?: number | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          delivery_service?: string | null
          delivery_type?: string | null
          id?: string
          latitude?: number | null
          listing_id?: string
          longitude?: number | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      purchase_listing: {
        Args: { p_listing_id: string; p_quantity: number }
        Returns: Json
      }
    }
    Enums: {
      delivery_type: "pickup" | "third_party"
      listing_status: "available" | "reserved" | "sold"
      reservation_status: "reserved" | "collected"
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
      delivery_type: ["pickup", "third_party"],
      listing_status: ["available", "reserved", "sold"],
      reservation_status: ["reserved", "collected"],
    },
  },
} as const
