import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Users, Star, FolderKanban, Clock, CheckCircle2, AlertTriangle,
  ArrowRight, TrendingUp, Megaphone, CheckSquare, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Client, Task, Project } from "../lib/supabase";
import { mockClients, mockInfluencers, mockProjects, mockTasks } from "../lib/mockData";
import { mockCampaigns, mockApprovals, mockFinanceRecords } from "../lib/enterpriseData";

export default function Dashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  const stats = isSupabaseConfigured ? null : {
    totalClients: mockClients.length,
    totalInfluencers: mockInfluencers.length,
    activeCampaigns: mockCampaigns.filter(c => c.status === "active").length,
    pendingApprovals: mockApprovals.filter(a => a.status === "pending").length,
    pendingTasks: mockTasks.filter(t => t.status !== "completed" && t.status !== "cancelled").length,
    overdueTasks: mockTasks.filter(t => t.status !== "completed" && t.status !== "cancelled" && !!t.due_date && t.due_date < todayStr).length,
    totalRevenue: mockFinanceRecords.reduce((s, r) => s + r.client_price, 0),
    totalProfit: mockFinanceRecords.reduce((s, r) => s + (r.client_price - r.final_cost), 0),
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
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
      const [rcl, rtasks, rproj] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("projects").select("*, client:clients(name)").order("created_at", { ascending: false }).limit(5),
      ]);
      setRecentClients((rcl.data || []) as Client[]);
      setRecentTasks((rtasks.data || []) as Task[]);
      setRecentProjects((rproj.data || []) as Project[]);
    } finally {
      setLoading(false);
    }
  }

  const statCards = stats ? [
    { key: "activeCampaigns", value: stats.activeCampaigns, icon: Megaphone, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-950/50", href: "/campaigns" },
    { key: "pendingApprovals", value: stats.pendingApprovals, icon: CheckSquare, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/50", href: "/approvals" },
    { key: "totalClients", value: stats.totalClients, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/50", href: "/clients" },
    { key: "totalInfluencers", value: stats.totalInfluencers, icon: Star, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-950/50", href: "/influencers" },
    { key: "pendingTasks", value: stats.pendingTasks, icon: Clock, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950/50", href: "/tasks" },
    { key: "overdueTasks", value: stats.overdueTasks, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-950/50", href: "/tasks" },
  ] : [];

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
  const campaignPriorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700",
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
        {statCards.map(({ key, value, icon: Icon, color, bg, href }) => (
          <Link
            key={key}
            href={href}
            className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
          >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg)}>
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {loading ? <div className="w-10 h-6 bg-muted rounded animate-pulse" /> : value.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-snug">{t(`dashboard.${key}`)}</div>
          </Link>
        ))}
      </div>

      {/* Finance KPIs */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">{t("dashboard.totalRevenue")}</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm opacity-70 mt-0.5">ر.س</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-sm font-medium opacity-80">{t("finance.totalProfit")}</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalProfit.toLocaleString()}</div>
            <div className="text-sm opacity-70 mt-0.5">ر.س</div>
          </div>
        </div>
      )}

      {/* Recent rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">{t("dashboard.recentCampaigns")}</h3>
            <Link href="/campaigns" className="text-xs text-primary flex items-center gap-1 hover:underline">
              {t("common.view")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockCampaigns.slice(0, 4).map(c => {
              const pct = Math.round(([
                "new_request","request_review","influencer_shortlisting","internal_approval",
                "client_review","client_approval","influencer_outreach","negotiation",
                "contract_confirmation","content_production","content_approval","publishing",
                "performance_tracking","final_report","campaign_closed"
              ].indexOf(c.current_stage) + 1) / 15 * 100);
              return (
                <div key={c.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{pct}%</span>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0", campaignPriorityColors[c.priority])}>
                    {t(`campaigns.priorities.${c.priority}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">{t("dashboard.recentProjects")}</h3>
            <Link href="/projects" className="text-xs text-primary flex items-center gap-1 hover:underline">
              {t("common.view")} <ArrowRight className="w-3 h-3" />
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
            <Link href="/tasks" className="text-xs text-primary flex items-center gap-1 hover:underline">
              {t("common.view")} <ArrowRight className="w-3 h-3" />
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
            <Link href="/clients" className="text-xs text-primary flex items-center gap-1 hover:underline">
              {t("common.view")} <ArrowRight className="w-3 h-3" />
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
                  <span className="text-xs font-semibold text-primary">{client.name.charAt(0)}</span>
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
