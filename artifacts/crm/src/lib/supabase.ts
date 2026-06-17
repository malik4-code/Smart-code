import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: Client;
        Insert: Omit<Client, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Client, "id" | "created_at">>;
      };
      influencers: {
        Row: Influencer;
        Insert: Omit<Influencer, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Influencer, "id" | "created_at">>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Project, "id" | "created_at">>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Task, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Profile>;
      };
    };
  };
};

export interface Client {
  id: string;
  name: string;
  industry: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  contact_person: string | null;
  status: "active" | "inactive";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Influencer {
  id: string;
  name: string;
  platform: string;
  category: string | null;
  city: string | null;
  followers: number | null;
  engagement_rate: number | null;
  estimated_price: number | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  client_id: string | null;
  description: string | null;
  budget: number | null;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  project_influencers?: ProjectInfluencer[];
}

export interface ProjectInfluencer {
  id: string;
  project_id: string;
  influencer_id: string;
  influencer?: Influencer;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  assignee_id: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
  assignee?: Profile;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "manager" | "employee";
  avatar_url: string | null;
  created_at: string;
}
