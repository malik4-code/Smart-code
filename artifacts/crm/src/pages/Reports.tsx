import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

interface ReportData {
  projectsByStatus: { name: string; value: number }[];
  tasksByStatus: { name: string; value: number }[];
  tasksByPriority: { name: string; value: number }[];
  influencersByPlatform: { name: string; value: number }[];
  clientsByStatus: { name: string; value: number }[];
  totalBudget: number;
  avgBudget: number;
}

export default function Reports() {
  const { t } = useTranslation();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    fetchReportData();
  }, []);

  async function fetchReportData() {
    setLoading(true);
    try {
      const [projects, tasks, influencers, clients] = await Promise.all([
        supabase.from("projects").select("status, budget"),
        supabase.from("tasks").select("status, priority"),
        supabase.from("influencers").select("platform"),
        supabase.from("clients").select("status"),
      ]);

      const countBy = <T extends Record<string, unknown>>(arr: T[], key: keyof T) => {
        const counts: Record<string, number> = {};
        for (const item of arr) {
          const v = String(item[key] || "unknown");
          counts[v] = (counts[v] || 0) + 1;
        }
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
      };

      const pData = (projects.data || []);
      const budgets = pData.map((p: any) => p.budget || 0).filter((b: number) => b > 0);

      setData({
        projectsByStatus: countBy(pData as any[], "status"),
        tasksByStatus: countBy((tasks.data || []) as any[], "status"),
        tasksByPriority: countBy((tasks.data || []) as any[], "priority"),
        influencersByPlatform: countBy((influencers.data || []) as any[], "platform"),
        clientsByStatus: countBy((clients.data || []) as any[], "status"),
        totalBudget: budgets.reduce((a: number, b: number) => a + b, 0),
        avgBudget: budgets.length ? budgets.reduce((a: number, b: number) => a + b, 0) / budgets.length : 0,
      });
    } finally {
      setLoading(false);
    }
  }

  function translateKey(section: string, key: string) {
    const map: Record<string, Record<string, string>> = {
      projects: { planning: t("projects.statuses.planning"), active: t("projects.statuses.active"), on_hold: t("projects.statuses.on_hold"), completed: t("projects.statuses.completed"), cancelled: t("projects.statuses.cancelled") },
      tasks_status: { pending: t("tasks.statuses.pending"), in_progress: t("tasks.statuses.in_progress"), completed: t("tasks.statuses.completed"), cancelled: t("tasks.statuses.cancelled") },
      tasks_priority: { low: t("tasks.priorities.low"), medium: t("tasks.priorities.medium"), high: t("tasks.priorities.high"), urgent: t("tasks.priorities.urgent") },
      platforms: { instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", twitter: "Twitter/X", snapchat: "Snapchat", linkedin: "LinkedIn", facebook: "Facebook", other: t("common.all") },
      clients: { active: t("clients.active"), inactive: t("clients.inactive") },
    };
    return map[section]?.[key] || key;
  }

  function translateChartData(chartData: { name: string; value: number }[], section: string) {
    return chartData.map(d => ({ ...d, name: translateKey(section, d.name) }));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">{t("reports.title")}</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-64 animate-pulse">
              <div className="w-32 h-5 bg-muted rounded mb-4" />
              <div className="h-40 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured || !data) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">{t("reports.title")}</h1></div>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground text-sm">{t("errors.noSupabaseConfig")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("reports.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("reports.subtitle")}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("reports.totalBudget"), value: `${data.totalBudget.toLocaleString()} ${t("common.sar")}` },
          { label: t("reports.avgBudget"), value: `${Math.round(data.avgBudget).toLocaleString()} ${t("common.sar")}` },
          { label: t("dashboard.totalProjects"), value: data.projectsByStatus.reduce((a, b) => a + b.value, 0) },
          { label: t("dashboard.totalClients"), value: data.clientsByStatus.reduce((a, b) => a + b.value, 0) },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="text-xl font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects by Status */}
        <ChartCard title={t("reports.projectsByStatus")}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={translateChartData(data.projectsByStatus, "projects")} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name={t("common.total")} radius={[4, 4, 0, 0]}>
                {data.projectsByStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tasks by Status */}
        <ChartCard title={t("reports.tasksByStatus")}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={translateChartData(data.tasksByStatus, "tasks_status")} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {data.tasksByStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Influencers by Platform */}
        <ChartCard title={t("reports.topPlatforms")}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={translateChartData(data.influencersByPlatform, "platforms")} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                {data.influencersByPlatform.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tasks by Priority */}
        <ChartCard title={t("tasks.priority")}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={translateChartData(data.tasksByPriority, "tasks_priority")} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name={t("common.total")} radius={[4, 4, 0, 0]}>
                {data.tasksByPriority.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}
