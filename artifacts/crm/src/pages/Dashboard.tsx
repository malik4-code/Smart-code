import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Users, Star, FolderKanban, Clock, CheckCircle2, AlertTriangle,
  ArrowRight, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Client, Task, Project } from "../lib/supabase";
import { mockClients, mockInfluencers, mockProjects, mockTasks } from "../lib/mockData";

interface Stats {
  totalClients: number;
  totalInfluencers: number;
  totalProjects: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalClients: 0, totalInfluencers: 0, totalProjects: 0,
    pendingTasks: 0, completedTasks: 0, overdueTasks: 0,
  });
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const todayStr = new Date().toISOString().split("T")[0];
      setStats({
        totalClients: mockClients.length,
        totalInfluencers: mockInfluencers.length,
        totalProjects: mockProjects.length,
        pendingTasks: mockTasks.filter(t => t.status !== "completed" && t.status !== "cancelled").length,
        completedTasks: mockTasks.filter(t => t.status === "completed").length,
        overdueTasks: mockTasks.filter(t => t.status !== "completed" && t.status !== "cancelled" && !!t.due_date && t.due_date < todayStr).length,
      });
      setRecentClients(mockClients.slice(0, 5) as Client[]);
      setRecentTasks(mockTasks.slice(0, 5) as Task[]);
      setRecentProjects(mockProjects.slice(0, 5) as Project[]);
      setLoading(false);
      return;
    }
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const [c, inf, proj, pend, comp, over, rcl, rtasks, rproj] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("influencers").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["pending", "in_progress"]),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["pending", "in_progress"]).lt("due_date", today),
        supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("projects").select("*, client:clients(name)").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        totalClients: c.count || 0, totalInfluencers: inf.count || 0,
        totalProjects: proj.count || 0, pendingTasks: pend.count || 0,
        completedTasks: comp.count || 0, overdueTasks: over.count || 0,
      });
      setRecentClients((rcl.data || []) as Client[]);
      setRecentTasks((rtasks.data || []) as Task[]);
      setRecentProjects((rproj.data || []) as Project[]);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { key: "totalClients", icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/50", href: "/clients" },
    { key: "totalInfluencers", icon: Star, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950/50", href: "/influencers" },
    { key: "totalProjects", icon: FolderKanban, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-950/50", href: "/projects" },
    { key: "pendingTasks", icon: Clock, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/50", href: "/tasks" },
    { key: "completedTasks", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 dark:bg-green-950/50", href: "/tasks" },
    { key: "overdueTasks", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-950/50", href: "/tasks" },
  ];

  const statValues = [
    stats.totalClients, stats.totalInfluencers, stats.totalProjects,
    stats.pendingTasks, stats.completedTasks, stats.overdueTasks,
  ];

  const projectStatusColors: Record<string, string> = {
    planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  const taskPriorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-600",
    high: "bg-orange-100 text-orange-600", urgent: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
        {profile && (
          <p className="text-muted-foreground mt-1 text-sm">
            {t("dashboard.welcomeBack")}, {profile.full_name || profile.email}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ key, icon: Icon, color, bg, href }, i) => (
          <Link key={key} href={href}>
            <a className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg)}>
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {loading ? (
                  <div className="w-10 h-6 bg-muted rounded animate-pulse" />
                ) : statValues[i].toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-snug">{t(`dashboard.${key}`)}</div>
            </a>
          </Link>
        ))}
      </div>

      {/* Recent rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">{t("dashboard.recentProjects")}</h3>
            <Link href="/projects">
              <a className="text-xs text-primary flex items-center gap-1 hover:underline">
                {t("common.view")} <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-16 h-5 bg-muted rounded-full animate-pulse ms-auto" />
                </div>
              ))
            ) : recentProjects.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
            ) : recentProjects.map(p => (
              <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{(p as any).client?.name || "—"}</p>
                </div>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0", projectStatusColors[p.status] || "bg-gray-100 text-gray-600")}>
                  {t(`projects.statuses.${p.status}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">{t("dashboard.recentTasks")}</h3>
            <Link href="/tasks">
              <a className="text-xs text-primary flex items-center gap-1 hover:underline">
                {t("common.view")} <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-36 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-14 h-5 bg-muted rounded-full animate-pulse ms-auto" />
                </div>
              ))
            ) : recentTasks.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
            ) : recentTasks.map(task => (
              <div key={task.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}
                  </p>
                </div>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0", taskPriorityColors[task.priority])}>
                  {t(`tasks.priorities.${task.priority}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">{t("dashboard.recentClients")}</h3>
            <Link href="/clients">
              <a className="text-xs text-primary flex items-center gap-1 hover:underline">
                {t("common.view")} <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                </div>
              ))
            ) : recentClients.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">{t("common.noData")}</div>
            ) : recentClients.map(client => (
              <div key={client.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{client.industry || client.email || "—"}</p>
                </div>
                <span className={cn(
                  "ms-auto px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                  client.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {t(`clients.${client.status}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
