import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  Megaphone, Plus, Search, Filter, ChevronRight,
  Users, DollarSign, Calendar, AlertTriangle, CheckCircle2, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCampaigns, type MockCampaign, type CampaignStage } from "../lib/enterpriseData";

const STAGE_ORDER: CampaignStage[] = [
  "new_request", "request_review", "influencer_shortlisting", "internal_approval",
  "client_review", "client_approval", "influencer_outreach", "negotiation",
  "contract_confirmation", "content_production", "content_approval", "publishing",
  "performance_tracking", "final_report", "campaign_closed",
];

function stageProgress(stage: CampaignStage): number {
  return Math.round(((STAGE_ORDER.indexOf(stage) + 1) / STAGE_ORDER.length) * 100);
}

export default function Campaigns() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = mockCampaigns.filter(c => {
    const matchSearch = c.name.includes(search) || c.client_name.includes(search) || c.account_manager.includes(search);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPriority = priorityFilter === "all" || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const activeCampaigns = mockCampaigns.filter(c => c.status === "active").length;
  const totalBudget = mockCampaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = mockCampaigns.reduce((s, c) => s + c.spent, 0);
  const pendingApprovals = mockCampaigns.filter(c => c.status === "active" && c.current_stage.includes("approval")).length;

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  function formatNum(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n.toString();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("campaigns.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("campaigns.subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          {t("campaigns.addCampaign")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("dashboard.activeCampaigns"), value: activeCampaigns, icon: Megaphone, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/50" },
          { label: t("campaigns.budget"), value: formatNum(totalBudget) + " ر.س", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-950/50" },
          { label: t("campaigns.spent"), value: formatNum(totalSpent) + " ر.س", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/50" },
          { label: t("dashboard.pendingApprovals"), value: pendingApprovals, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-950/50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full ps-9 pe-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={t("campaigns.search")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("common.all")}</option>
            {["active", "paused", "completed", "cancelled"].map(s => (
              <option key={s} value={s}>{t(`campaigns.statuses.${s}`)}</option>
            ))}
          </select>
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="all">{t("common.all")}</option>
            {["urgent", "high", "medium", "low"].map(p => (
              <option key={p} value={p}>{t(`campaigns.priorities.${p}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaign Cards */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-muted-foreground">
          {t("campaigns.noCampaigns")}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign}
              priorityColors={priorityColors} statusColors={statusColors} />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign, priorityColors, statusColors }: {
  campaign: MockCampaign;
  priorityColors: Record<string, string>;
  statusColors: Record<string, string>;
}) {
  const { t } = useTranslation();
  const progress = stageProgress(campaign.current_stage);
  const budgetPct = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0;
  const remaining = campaign.budget - campaign.spent;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors truncate">
              {campaign.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{campaign.client_name}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityColors[campaign.priority])}>
              {t(`campaigns.priorities.${campaign.priority}`)}
            </span>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[campaign.status])}>
              {t(`campaigns.statuses.${campaign.status}`)}
            </span>
          </div>
        </div>

        {/* Current stage */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            {t("campaigns.currentStage")}:
          </span>
          <span className="text-xs font-medium text-foreground">
            {t(`campaigns.stages.${campaign.current_stage}`)}
          </span>
        </div>

        {/* Stage progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">{t("campaigns.stageProgress")}</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Budget */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">{t("campaigns.budgetUsage")}</span>
            <span className={cn("text-xs font-medium", budgetPct > 90 ? "text-red-600" : budgetPct > 70 ? "text-amber-600" : "text-foreground")}>
              {budgetPct}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-amber-500" : "bg-emerald-500")}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {campaign.influencers.length}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {campaign.end_date}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {remaining.toLocaleString()} ر.س {t("campaigns.remaining")}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
        </div>
    </Link>
  );
}
