export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          crown_count: number;
          role: "user" | "moderator" | "admin";
          is_banned: boolean;
          ban_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          crown_count?: number;
          role?: "user" | "moderator" | "admin";
          is_banned?: boolean;
          ban_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          crown_count?: number;
          role?: "user" | "moderator" | "admin";
          is_banned?: boolean;
          ban_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      species: {
        Row: {
          id: number;
          scientific_name: string;
          common_names: string[];
          family: string | null;
          status: "approved" | "pending" | "rejected";
          submitted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          scientific_name: string;
          common_names?: string[];
          family?: string | null;
          status?: "approved" | "pending" | "rejected";
          submitted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          scientific_name?: string;
          common_names?: string[];
          family?: string | null;
          status?: "approved" | "pending" | "rejected";
          submitted_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "species_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      species_synonyms: {
        Row: {
          id: number;
          species_id: number;
          synonym_name: string;
          synonym_type: "scientific" | "common" | "basionym";
          created_at: string;
        };
        Insert: {
          id?: number;
          species_id: number;
          synonym_name: string;
          synonym_type?: "scientific" | "common" | "basionym";
          created_at?: string;
        };
        Update: {
          id?: number;
          species_id?: number;
          synonym_name?: string;
          synonym_type?: "scientific" | "common" | "basionym";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "species_synonyms_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          species_id: number;
          image_url: string;
          thumbnail_url: string | null;
          caption: string | null;
          week_year: string;
          report_count: number;
          is_hidden: boolean;
          is_removed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          species_id: number;
          image_url: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          week_year: string;
          report_count?: number;
          is_hidden?: boolean;
          is_removed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          species_id?: number;
          image_url?: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          week_year?: string;
          report_count?: number;
          is_hidden?: boolean;
          is_removed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
        ];
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          week_year: string;
          species_id: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          week_year: string;
          species_id: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          week_year?: string;
          species_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          post_id: string;
          reason: "nsfw" | "off_topic" | "spam" | "other";
          details: string | null;
          status: "pending" | "reviewed" | "dismissed";
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          post_id: string;
          reason: "nsfw" | "off_topic" | "spam" | "other";
          details?: string | null;
          status?: "pending" | "reviewed" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          post_id?: string;
          reason?: "nsfw" | "off_topic" | "spam" | "other";
          details?: string | null;
          status?: "pending" | "reviewed" | "dismissed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_winners: {
        Row: {
          id: number;
          week_year: string;
          species_id: number;
          post_id: string;
          user_id: string;
          vote_count: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          week_year: string;
          species_id: number;
          post_id: string;
          user_id: string;
          vote_count?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          week_year?: string;
          species_id?: number;
          post_id?: string;
          user_id?: string;
          vote_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "weekly_winners_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weekly_winners_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weekly_winners_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_week_year: {
        Args: Record<string, never>;
        Returns: string;
      };
      search_species: {
        Args: {
          query: string;
          max_results?: number;
        };
        Returns: {
          id: number;
          scientific_name: string;
          common_names: string[];
          family: string | null;
          similarity: number;
          matched_via: string;
        }[];
      };
      get_post_vote_count: {
        Args: {
          target_post_id: string;
        };
        Returns: number;
      };
      swap_vote: {
        Args: {
          p_user_id: string;
          p_new_post_id: string;
          p_species_id: number;
          p_week_year: string;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Species = Database["public"]["Tables"]["species"]["Row"];
export type SpeciesSynonym =
  Database["public"]["Tables"]["species_synonyms"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type WeeklyWinner =
  Database["public"]["Tables"]["weekly_winners"]["Row"];
