import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, RotateCcw, Clock, AlertTriangle, ChevronDown, ChevronUp, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockApprovals, type MockApproval, type ApprovalStatus } from "../lib/enterpriseData";

export default function Approvals() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = mockApprovals.filter(a => filter === "all" || a.status === filter);

  const counts = {
    all: mockApprovals.length,
    pending: mockApprovals.filter(a => a.status === "pending").length,
    approved: mockApprovals.filter(a => a.status === "approved").length,
    rejected: mockApprovals.filter(a => a.status === "rejected").length,
    needs_revision: mockApprovals.filter(a => a.status === "needs_revision").length,
  };

  const statusColors: Record<ApprovalStatus, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    needs_revision: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  };
  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700",
  };
  const typeIcons: Record<string, string> = {
    campaign: "📋", influencer_list: "👥", budget: "💰", content: "📝", contract: "📄",
  };

  function formatTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return t("common.justNow");
    if (h < 24) return `${h} ${t("common.hoursAgo")}`;
    return `${Math.floor(h / 24)} ${t("common.daysAgo")}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("approvals.title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("approvals.subtitle")}</p>
      </div>

      {/* Tab filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "needs_revision", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {f === "all" ? t("approvals.allApprovals") :
             f === "needs_revision" ? t("approvals.needsRevision") :
             t(`approvals.${f}`)}
            <span className="ms-2 bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-xs">
              {counts[f === "needs_revision" ? "needs_revision" : f as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Approvals list */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-muted-foreground">
          {t("approvals.noApprovals")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(approval => (
            <div key={approval.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              {/* Header */}
              <div
                className="px-5 py-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setExpanded(expanded === approval.id ? null : approval.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{typeIcons[approval.type]}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{approval.title}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {t(`approvals.types.${approval.type}`)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{approval.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {approval.campaign_name && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          📋 {approval.campaign_name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {approval.requested_by}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(approval.requested_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", priorityColors[approval.priority])}>
                    {t(`campaigns.priorities.${approval.priority}`)}
                  </span>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusColors[approval.status])}>
                    {approval.status === "needs_revision" ? t("approvals.needsRevision") : t(`approvals.${approval.status}`)}
                  </span>
                  {expanded === approval.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Expanded: approval chain */}
              {expanded === approval.id && (
                <div className="px-5 pb-5 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-3">
                    {t("approvals.approvalChain")}
                  </h4>
                  <div className="space-y-3">
                    {approval.levels.map((level, idx) => (
                      <div key={idx} className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        level.status === "approved" ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800" :
                        level.status === "rejected" ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800" :
                        level.status === "needs_revision" ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800" :
                        level.level === approval.current_level ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800" :
                        "bg-muted/30 border-border"
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0",
                          level.status === "approved" ? "bg-green-100 text-green-700" :
                          level.status === "rejected" ? "bg-red-100 text-red-700" :
                          level.status === "needs_revision" ? "bg-purple-100 text-purple-700" :
                          level.level === approval.current_level ? "bg-amber-100 text-amber-700" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {level.status === "approved" ? "✓" :
                           level.status === "rejected" ? "✗" :
                           level.status === "needs_revision" ? "↩" :
                           level.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{level.title}</p>
                              <p className="text-xs text-muted-foreground">{level.approver}</p>
                            </div>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[level.status as ApprovalStatus] || "bg-muted text-muted-foreground")}>
                              {level.status === "needs_revision" ? t("approvals.needsRevision") :
                               level.status === "pending" ? t("approvals.pending") :
                               level.status === "approved" ? t("approvals.approved") :
                               t("approvals.rejected")}
                            </span>
                          </div>
                          {level.comment && (
                            <p className="text-xs text-muted-foreground mt-1.5 bg-background/50 rounded p-2 border border-border">
                              💬 {level.comment}
                            </p>
                          )}
                          {level.date && (
                            <p className="text-xs text-muted-foreground/60 mt-1">{formatTime(level.date)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons for pending items */}
                  {approval.status === "pending" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> {t("approvals.approve")}
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <RotateCcw className="w-4 h-4" /> {t("approvals.requestRevision")}
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <XCircle className="w-4 h-4" /> {t("approvals.reject")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
