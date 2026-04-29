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
          last_notified_win_at: string | null;
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
          last_notified_win_at?: string | null;
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
          last_notified_win_at?: string | null;
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
          species_id: number | null;
          image_url: string;
          thumbnail_url: string | null;
          image_url_after: string | null;
          thumbnail_url_after: string | null;
          caption: string | null;
          site_description: string | null;
          post_type: "weed" | "before_after";
          week_year: string;
          view_count: number;
          report_count: number;
          is_hidden: boolean;
          is_removed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          species_id?: number | null;
          image_url: string;
          thumbnail_url?: string | null;
          image_url_after?: string | null;
          thumbnail_url_after?: string | null;
          caption?: string | null;
          site_description?: string | null;
          post_type?: "weed" | "before_after";
          week_year: string;
          view_count?: number;
          report_count?: number;
          is_hidden?: boolean;
          is_removed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          species_id?: number | null;
          image_url?: string;
          thumbnail_url?: string | null;
          image_url_after?: string | null;
          thumbnail_url_after?: string | null;
          caption?: string | null;
          site_description?: string | null;
          post_type?: "weed" | "before_after";
          week_year?: string;
          view_count?: number;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          week_year: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          week_year?: string;
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
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          report_count: number;
          is_hidden: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          report_count?: number;
          is_hidden?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          report_count?: number;
          is_hidden?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comment_reports: {
        Row: {
          id: string;
          reporter_id: string;
          comment_id: string;
          reason: "harassment" | "spam" | "off_topic" | "other";
          details: string | null;
          status: "pending" | "reviewed" | "dismissed";
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          comment_id: string;
          reason: "harassment" | "spam" | "off_topic" | "other";
          details?: string | null;
          status?: "pending" | "reviewed" | "dismissed";
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          comment_id?: string;
          reason?: "harassment" | "spam" | "off_topic" | "other";
          details?: string | null;
          status?: "pending" | "reviewed" | "dismissed";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comment_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_reports_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_winners: {
        Row: {
          id: number;
          week_year: string;
          post_type: "weed" | "before_after";
          place: number;
          post_id: string;
          user_id: string;
          vote_count: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          week_year: string;
          post_type: "weed" | "before_after";
          place: number;
          post_id: string;
          user_id: string;
          vote_count?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          week_year?: string;
          post_type?: "weed" | "before_after";
          place?: number;
          post_id?: string;
          user_id?: string;
          vote_count?: number;
          created_at?: string;
        };
        Relationships: [
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
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "comment" | "win";
          post_id: string | null;
          actor_id: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "comment" | "win";
          post_id?: string | null;
          actor_id?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "comment" | "win";
          post_id?: string | null;
          actor_id?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
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
      increment_view_count: {
        Args: {
          p_post_id: string;
        };
        Returns: undefined;
      };
      get_unseen_wins: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          id: number;
          week_year: string;
          post_type: string;
          place: number;
          vote_count: number;
          created_at: string;
        }[];
      };
      get_previous_week_year: {
        Args: Record<string, never>;
        Returns: string;
      };
      process_weekly_winners: {
        Args: { p_week_year: string };
        Returns: number;
      };
      get_unread_notification_count: {
        Args: { p_user_id: string };
        Returns: number;
      };
      mark_notifications_read: {
        Args: { p_user_id: string };
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
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentReport =
  Database["public"]["Tables"]["comment_reports"]["Row"];
export type Notification =
  Database["public"]["Tables"]["notifications"]["Row"];
