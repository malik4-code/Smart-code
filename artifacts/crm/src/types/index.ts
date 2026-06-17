export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

export interface NavItem {
  key: string;
  path: string;
  icon: string;
}

export type { Client, Influencer, Project, ProjectInfluencer, Task, Profile } from "../lib/supabase";
