import { useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  ArrowRight, CheckCircle2, Circle, Clock, AlertTriangle,
  Users, DollarSign, Calendar, ChevronLeft, Star,
  Instagram, Youtube, Twitter, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCampaigns, type CampaignStage, type CampaignInfluencer } from "../lib/enterpriseData";

const STAGE_ORDER: CampaignStage[] = [
  "new_request", "request_review", "influencer_shortlisting", "internal_approval",
  "client_review", "client_approval", "influencer_outreach", "negotiation",
  "contract_confirmation", "content_production", "content_approval", "publishing",
  "performance_tracking", "final_report", "campaign_closed",
];

const platformIcons: Record<string, string> = {
  instagram: "📸", youtube: "▶️", tiktok: "🎵", snapchat: "👻", twitter: "🐦", linkedin: "💼", facebook: "📘",
};

export default function CampaignDetail() {
  const { t } = useTranslation();
  const [, params] = useRoute("/campaigns/:id");
  const campaign = mockCampaigns.find(c => c.id === params?.id);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{t("errors.notFound")}</p>
        <Link href="/campaigns" className="text-primary hover:underline text-sm">
          {t("common.backToList")}
        </Link>
      </div>
    );
  }

  const progress = Math.round(((STAGE_ORDER.indexOf(campaign.current_stage) + 1) / STAGE_ORDER.length) * 100);
  const budgetPct = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0;

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700",
  };
  const influencerStatusColors: Record<string, string> = {
    shortlisted: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    client_approved: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    client_rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    contracted: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    content_done: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    published: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };

  function formatFollowers(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return n.toString();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back + Header */}
      <div>
        <Link
          href="/campaigns"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 w-fit"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          {t("common.backToList")}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{campaign.description}</p>
          </div>
          <span className={cn("px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 mt-1", priorityColors[campaign.priority])}>
            {t(`campaigns.priorities.${campaign.priority}`)}
          </span>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("campaigns.client"), value: campaign.client_name, icon: "🏢" },
          { label: t("campaigns.accountManager"), value: campaign.account_manager, icon: "👤" },
          { label: t("campaigns.startDate"), value: campaign.start_date, icon: "📅" },
          { label: t("campaigns.endDate"), value: campaign.end_date, icon: "🏁" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-medium text-foreground mt-0.5 truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* Budget */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          {t("campaigns.budget")} &amp; {t("campaigns.spent")}
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: t("campaigns.budget"), value: campaign.budget, color: "text-foreground" },
            { label: t("campaigns.spent"), value: campaign.spent, color: "text-amber-600" },
            { label: t("campaigns.remaining"), value: campaign.budget - campaign.spent, color: campaign.budget - campaign.spent < 0 ? "text-red-600" : "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className={cn("text-lg font-bold", color)}>{value.toLocaleString()} <span className="text-xs font-normal">ر.س</span></div>
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">{budgetPct}% {t("campaigns.budgetUsage")}</div>
      </div>

      {/* Workflow */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {t("campaigns.workflowStages")}
          </h2>
          <span className="text-xs text-muted-foreground">{progress}% {t("campaigns.stageProgress")}</span>
        </div>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-4 start-4 end-4 h-0.5 bg-muted" />
          <div
            className="absolute top-4 start-4 h-0.5 bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Stage dots — show 15 in 3 rows of 5 */}
          <div className="grid grid-cols-5 gap-2 relative">
            {campaign.stages.map((stage, idx) => (
              <div key={stage.stage} className="flex flex-col items-center gap-1.5 pt-0">
                {/* Dot */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 relative z-10",
                  stage.status === "completed" ? "bg-primary border-primary text-primary-foreground" :
                    stage.status === "active" ? "bg-primary/10 border-primary text-primary" :
                      "bg-background border-muted text-muted-foreground"
                )}>
                  {stage.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : stage.status === "active" ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <span className="text-xs">{idx + 1}</span>
                  )}
                </div>
                {/* Stage name */}
                <div className="text-center">
                  <p className={cn(
                    "text-xs leading-tight text-center",
                    stage.status === "active" ? "text-primary font-medium" :
                      stage.status === "completed" ? "text-muted-foreground" : "text-muted-foreground/60"
                  )}>
                    {t(`campaigns.stages.${stage.stage}`)}
                  </p>
                  {stage.sla_breached && (
                    <span className="text-xs text-red-500">⚠️ SLA</span>
                  )}
                  {stage.status === "active" && stage.owner && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{stage.owner}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Influencers Table */}
      {campaign.influencers.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {t("campaigns.influencers")} ({campaign.influencers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[t("influencers.name"), t("influencers.platform"), t("influencers.followers"),
                    t("finance.finalCost"), t("finance.clientPrice"), t("finance.profitMargin"),
                    t("common.status")].map(h => (
                    <th key={h} className="px-4 py-3 text-start text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaign.influencers.map((inf: CampaignInfluencer) => {
                  const margin = inf.client_price > 0 ? Math.round(((inf.client_price - (inf.discount_price ?? inf.cost)) / inf.client_price) * 100) : 0;
                  return (
                    <tr key={inf.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{inf.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs">
                          <span>{platformIcons[inf.platform] || "🔗"}</span>
                          {t(`influencers.platforms.${inf.platform}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{formatFollowers(inf.followers)}</td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {(inf.discount_price ?? inf.cost).toLocaleString()}
                        {inf.discount_price && (
                          <span className="ms-1 text-emerald-600 text-xs">(-{((1 - inf.discount_price / inf.cost) * 100).toFixed(0)}%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-emerald-600">{inf.client_price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold", margin > 20 ? "text-emerald-600" : margin > 10 ? "text-amber-600" : "text-red-600")}>
                          {margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs",
                          inf.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                          inf.status === "contracted" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                          inf.status === "client_approved" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                          inf.status === "client_rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        )}>
                          {t(`campaigns.influencerStatuses.${inf.status}`)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
