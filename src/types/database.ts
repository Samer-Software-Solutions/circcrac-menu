export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          enabled: boolean;
          id: string;
          name_ar: string;
          name_en: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          id?: string;
          name_ar: string;
          name_en: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          id?: string;
          name_ar?: string;
          name_en?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          available: boolean;
          category_id: string;
          created_at: string;
          description_ar: string | null;
          description_en: string | null;
          id: string;
          image_path: string | null;
          name_ar: string;
          name_en: string;
          price: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          available?: boolean;
          category_id: string;
          created_at?: string;
          description_ar?: string | null;
          description_en?: string | null;
          id?: string;
          image_path?: string | null;
          name_ar: string;
          name_en: string;
          price: number;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          available?: boolean;
          category_id?: string;
          created_at?: string;
          description_ar?: string | null;
          description_en?: string | null;
          id?: string;
          image_path?: string | null;
          name_ar?: string;
          name_en?: string;
          price?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          banner_path: string | null;
          currency: string;
          default_language: string;
          id: string;
          logo_path: string | null;
          primary_color: string | null;
          qr_background_color: string;
          qr_corner_dot_type: string;
          qr_corner_square_type: string;
          qr_dot_color: string;
          qr_dot_type: string;
          qr_logo_path: string | null;
          qr_logo_size: number;
          restaurant_name_ar: string;
          restaurant_name_en: string;
          tagline_ar: string | null;
          tagline_en: string | null;
          updated_at: string;
        };
        Insert: {
          banner_path?: string | null;
          currency?: string;
          default_language?: string;
          id?: string;
          logo_path?: string | null;
          primary_color?: string | null;
          qr_background_color?: string;
          qr_corner_dot_type?: string;
          qr_corner_square_type?: string;
          qr_dot_color?: string;
          qr_dot_type?: string;
          qr_logo_path?: string | null;
          qr_logo_size?: number;
          restaurant_name_ar: string;
          restaurant_name_en: string;
          tagline_ar?: string | null;
          tagline_en?: string | null;
          updated_at?: string;
        };
        Update: {
          banner_path?: string | null;
          currency?: string;
          default_language?: string;
          id?: string;
          logo_path?: string | null;
          primary_color?: string | null;
          qr_background_color?: string;
          qr_corner_dot_type?: string;
          qr_corner_square_type?: string;
          qr_dot_color?: string;
          qr_dot_type?: string;
          qr_logo_path?: string | null;
          qr_logo_size?: number;
          restaurant_name_ar?: string;
          restaurant_name_en?: string;
          tagline_ar?: string | null;
          tagline_en?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];
