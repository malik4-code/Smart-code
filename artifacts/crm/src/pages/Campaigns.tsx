import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  Megaphone, Plus, Search, Filter, ChevronRight,
  Users, DollarSign, Calendar, AlertTriangle, X,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockCampaigns, mockEnterpriseClients, mockTeamMembers,
  type MockCampaign, type CampaignStage, type CampaignStageInfo
} from "../lib/enterpriseData";

const STAGE_ORDER: CampaignStage[] = [
  "new_request", "request_review", "influencer_shortlisting", "internal_approval",
  "client_review", "client_approval", "influencer_outreach", "negotiation",
  "contract_confirmation", "content_production", "content_approval", "publishing",
  "performance_tracking", "final_report", "campaign_closed",
];

const ALL_STAGES: CampaignStage[] = [...STAGE_ORDER];

function stageProgress(stage: CampaignStage): number {
  return Math.round(((STAGE_ORDER.indexOf(stage) + 1) / STAGE_ORDER.length) * 100);
}

function createDefaultStages(): CampaignStageInfo[] {
  return ALL_STAGES.map((stage, i) => ({
    stage,
    status: (i === 0 ? "active" : "pending") as "completed" | "active" | "pending",
    owner: "",
    due_date: null,
    completed_date: null,
    notes: null,
    sla_hours: null,
    sla_breached: false,
  }));
}

const PLATFORMS = ["instagram", "tiktok", "snapchat", "x", "youtube", "facebook", "linkedin"];
const CATEGORIES = ["lifestyle", "fashion", "food", "tech", "beauty", "fitness", "travel", "business", "education", "entertainment", "sports", "gaming"];
const CAMPAIGN_TYPES = ["awareness", "engagement", "conversion", "branding", "launch", "seasonal"];

const emptyForm = {
  name: "", client_id: "", client_name: "", campaign_type: "awareness", objective: "",
  start_date: "", end_date: "", team_leader: "", account_manager: "",
  budget: "", priority: "medium", platforms: [] as string[], categories: [] as string[], notes: "",
};

export default function Campaigns() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [campaigns, setCampaigns] = useState<MockCampaign[]>([...mockCampaigns]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.includes(search) || c.client_name.includes(search) || c.account_manager.includes(search);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPriority = priorityFilter === "all" || c.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const pendingApprovals = campaigns.filter(c => c.status === "active" && c.current_stage.includes("approval")).length;

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

  function togglePlatform(p: string) {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  }

  function toggleCategory(c: string) {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(c) ? f.categories.filter(x => x !== c) : [...f.categories, c],
    }));
  }

  function handleClientChange(clientId: string) {
    const client = mockEnterpriseClients.find(c => c.id === clientId);
    setForm(f => ({ ...f, client_id: clientId, client_name: client?.brand_name || "" }));
  }

  function openDialog() {
    setForm({ ...emptyForm });
    setFormError("");
    setSuccessMsg("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError(t("common.required") + ": " + t("campaigns.campaignName")); return; }
    if (!form.client_id) { setFormError(t("common.required") + ": " + t("campaigns.client")); return; }
    if (!form.start_date || !form.end_date) { setFormError(t("common.required") + ": " + t("campaigns.startDate") + " / " + t("campaigns.endDate")); return; }
    if (!form.budget || isNaN(Number(form.budget))) { setFormError(t("common.required") + ": " + t("campaigns.budget")); return; }
    setSaving(true);
    setFormError("");

    await new Promise(r => setTimeout(r, 400));

    const leader = mockTeamMembers.find(m => m.id === form.team_leader);
    const accountMgr = mockTeamMembers.find(m => m.id === form.account_manager);
    const now = new Date().toISOString();

    const newCampaign: MockCampaign = {
      id: `camp-${Date.now()}`,
      name: form.name,
      client_id: form.client_id,
      client_name: form.client_name,
      account_manager: accountMgr?.name || (isAr ? "غير محدد" : "Unassigned"),
      team_leader: leader?.name || (isAr ? "غير محدد" : "Unassigned"),
      budget: Number(form.budget),
      spent: 0,
      current_stage: "new_request",
      stages: createDefaultStages(),
      influencers: [],
      start_date: form.start_date,
      end_date: form.end_date,
      status: "active",
      priority: form.priority as MockCampaign["priority"],
      description: form.objective || (form.notes || ""),
      created_at: now,
      updated_at: now,
    };

    mockCampaigns.unshift(newCampaign);
    setCampaigns([...mockCampaigns]);
    setSaving(false);
    setSuccessMsg(t("campaigns.addSuccess") || "Campaign created successfully!");
    setTimeout(() => { setDialogOpen(false); setSuccessMsg(""); }, 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("campaigns.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("campaigns.subtitle")}</p>
        </div>
        <button
          onClick={openDialog}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t("campaigns.addCampaign")}
        </button>
      </div>

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

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">{t("campaigns.addCampaign")}</h2>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">{formError}</div>
              )}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">{successMsg}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={`${t("campaigns.campaignName")} *`}>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls} placeholder={isAr ? "أدخل اسم الحملة" : "Enter campaign name"} />
                </FormField>
                <FormField label={`${t("campaigns.client")} *`}>
                  <select value={form.client_id} onChange={e => handleClientChange(e.target.value)} className={inputCls}>
                    <option value="">{t("campaigns.selectClient") || "Select Client"}</option>
                    {mockEnterpriseClients.map(c => (
                      <option key={c.id} value={c.id}>{c.brand_name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label={t("campaigns.campaignType") || "Campaign Type"}>
                  <select value={form.campaign_type} onChange={e => setForm(f => ({ ...f, campaign_type: e.target.value }))} className={inputCls}>
                    {CAMPAIGN_TYPES.map(ct => (
                      <option key={ct} value={ct}>{t(`campaigns.campaignTypes.${ct}`) || ct}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label={t("campaigns.priority")}>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={inputCls}>
                    {["urgent", "high", "medium", "low"].map(p => (
                      <option key={p} value={p}>{t(`campaigns.priorities.${p}`)}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label={`${t("campaigns.startDate")} *`}>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
                <FormField label={`${t("campaigns.endDate")} *`}>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
                <FormField label={t("campaigns.teamLeader")}>
                  <select value={form.team_leader} onChange={e => setForm(f => ({ ...f, team_leader: e.target.value }))} className={inputCls}>
                    <option value="">{t("common.select")}</option>
                    {mockTeamMembers.filter(m => ["team_leader", "dept_manager", "admin"].includes(m.role)).map(m => (
                      <option key={m.id} value={m.id}>{m.name} — {t(`roles.${m.role}`)}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label={t("campaigns.accountManager")}>
                  <select value={form.account_manager} onChange={e => setForm(f => ({ ...f, account_manager: e.target.value }))} className={inputCls}>
                    <option value="">{t("common.select")}</option>
                    {mockTeamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} — {t(`roles.${m.role}`)}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label={`${t("campaigns.budget")} *`}>
                <div className="relative">
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className={cn(inputCls, "pe-12")} dir="ltr" placeholder="0" />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ر.س</span>
                </div>
              </FormField>

              <FormField label={t("campaigns.objective") || "Campaign Objective"}>
                <textarea value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                  rows={2} className={cn(inputCls, "h-auto py-2 resize-none")}
                  placeholder={isAr ? "أدخل هدف الحملة..." : "Describe the campaign objective..."} />
              </FormField>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  {t("campaigns.platforms") || "Platforms"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        form.platforms.includes(p)
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      )}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  {t("campaigns.influencerCategories") || "Influencer Categories"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={() => toggleCategory(c)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        form.categories.includes(c)
                          ? "bg-primary/10 text-primary border-primary/40"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                      )}>
                      {t(`influencers.categories.${c}`) || c}
                    </button>
                  ))}
                </div>
              </div>

              <FormField label={t("common.notes")}>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} className={cn(inputCls, "h-auto py-2 resize-none")}
                  placeholder={isAr ? "ملاحظات إضافية..." : "Additional notes..."} />
              </FormField>

              {form.client_id && form.name && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                  <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    {isAr
                      ? `سيتم إنشاء حملة "${form.name}" لعميل "${form.client_name}" مع ${15} مهام تلقائية في سير العمل`
                      : `Campaign "${form.name}" for "${form.client_name}" will be created with 15 default workflow tasks`
                    }
                  </span>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex items-center justify-end gap-3">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                {t("common.cancel")}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{isAr ? "جاري الإنشاء..." : "Creating..."}</>
                ) : (
                  <>{isAr ? "إنشاء الحملة" : "Create Campaign"}</>
                )}
              </button>
            </div>
          </div>
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

      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
        <span className="text-xs text-muted-foreground">{t("campaigns.currentStage")}:</span>
        <span className="text-xs font-medium text-foreground">{t(`campaigns.stages.${campaign.current_stage}`)}</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">{t("campaigns.stageProgress")}</span>
          <span className="text-xs font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

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

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{campaign.influencers.length}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{campaign.end_date}</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{remaining.toLocaleString()} ر.س {t("campaigns.remaining")}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
      </div>
    </Link>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="block text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}
