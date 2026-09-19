/**
 * Hand-written database types matching the proposed Sprint 0 schema.
 *
 * Once the schema is applied to a real Supabase project, replace this file
 * by generating types directly from the database:
 *
 *   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 *
 * Keeping this file hand-written for now lets the app compile before a
 * Supabase project exists.
 */

export type UserRole = "customer" | "staff" | "admin";

export type OrderStatus =
  | "received"
  | "verified"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export type PaymentMethod = "cash" | "card";

export type StaffRole = "cashier" | "waitress" | "staff";

export type StaffProfile =
  Database["public"]["Tables"]["staff_profiles"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export interface Database {
  public: {
    Tables: {
      staff_profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          staff_id: string;
          name: string;
          role: StaffRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          staff_id: string;
          name: string;
          role?: StaffRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          staff_id?: string;
          name?: string;
          role?: StaffRole;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          member_id: string;
          full_name: string | null;
          email: string | null;
          role: UserRole;
          avatar_url: string | null;
          phone: string | null;
          birthday: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          member_id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          birthday?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          member_id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          birthday?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_tables: {
        Row: {
          id: string;
          table_number: string;
          qr_token: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_number: string;
          qr_token: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          table_number?: string;
          qr_token?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          display_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          is_popular: boolean;
          spice_level: number | null;
          allergens: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          is_popular?: boolean;
          spice_level?: number | null;
          allergens?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          is_popular?: boolean;
          spice_level?: number | null;
          allergens?: string[] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          table_id: string;
          customer_id: string | null;
          guest_session_id: string | null;
          status: OrderStatus;
          subtotal: number;
          service_charge: number;
          total: number;
          payment_status: PaymentStatus;
          payment_method: PaymentMethod | null;
          special_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          table_id: string;
          customer_id?: string | null;
          guest_session_id?: string | null;
          status?: OrderStatus;
          subtotal: number;
          service_charge?: number;
          total: number;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod | null;
          special_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: PaymentMethod | null;
          special_note?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "restaurant_tables";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          item_name_snapshot: string;
          unit_price: number;
          quantity: number;
          selected_options: Record<string, unknown> | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          item_name_snapshot: string;
          unit_price: number;
          quantity: number;
          selected_options?: Record<string, unknown> | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          selected_options?: Record<string, unknown> | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_menu_item_id_fkey";
            columns: ["menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          }
        ];
      };
      ai_food_matches: {
        Row: {
          id: string;
          customer_id: string | null;
          session_id: string | null;
          preferences: unknown;
          top_match_food_id: string | null;
          match_percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          session_id?: string | null;
          preferences: unknown;
          top_match_food_id?: string | null;
          match_percentage: number;
          created_at?: string;
        };
        Update: {
          preferences?: unknown;
          top_match_food_id?: string | null;
          match_percentage?: number;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          order_id: string;
          customer_id: string | null;
          overall_rating: number;
          food_rating: number | null;
          service_rating: number | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          customer_id?: string | null;
          overall_rating: number;
          food_rating?: number | null;
          service_rating?: number | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          overall_rating?: number;
          food_rating?: number | null;
          service_rating?: number | null;
          comment?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_receipt_customer_profile: {
        Args: { p_order_id: string };
        Returns: { full_name: string | null; phone: string | null; member_id: string | null }[];
      };
      send_order_to_kitchen: {
        Args: { p_order_id: string };
        Returns: { id: string; status: string }[];
      };
    };
  };
}
