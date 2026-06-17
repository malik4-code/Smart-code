import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, Activity, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockActivities, type MockActivity, type ActivityType } from "../lib/enterpriseData";

const TYPE_ICONS: Record<ActivityType, string> = {
  stage_change: "🔄", approval: "✅", comment: "💬", upload: "📁",
  price_change: "💰", status_change: "🏷️", login: "🔐", create: "➕",
  update: "✏️", delete: "🗑️",
};

const TYPE_COLORS: Record<ActivityType, string> = {
  stage_change: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  approval: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  comment: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  upload: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  price_change: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  status_change: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  login: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  create: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  update: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  delete: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const ACTIVITY_TYPES: ActivityType[] = [
  "stage_change", "approval", "comment", "upload", "price_change",
  "status_change", "login", "create", "update", "delete"
];

export default function ActivityLog() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const users = Array.from(new Set(mockActivities.map(a => a.user)));

  const filtered = mockActivities.filter(a => {
    const matchSearch = a.action_ar.includes(search) || a.user.includes(search) || a.entity_ar.includes(search);
    const matchType = typeFilter === "all" || a.type === typeFilter;
    const matchUser = userFilter === "all" || a.user === userFilter;
    return matchSearch && matchType && matchUser;
  });

  function formatTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return t("common.justNow");
    if (h < 24) return `${h} ${t("common.hoursAgo")}`;
    return `${Math.floor(h / 24)} ${t("common.daysAgo")}`;
  }

  function formatFullDate(iso: string) {
    return new Date(iso).toLocaleString("ar-SA", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  // Group by day
  function getDateGroup(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "اليوم";
    if (days === 1) return "أمس";
    return new Date(iso).toLocaleDateString("ar-SA", { weekday: "long", month: "short", day: "numeric" });
  }

  const grouped = filtered.reduce((acc, activity) => {
    const group = getDateGroup(activity.created_at);
    if (!acc[group]) acc[group] = [];
    acc[group].push(activity);
    return acc;
  }, {} as Record<string, MockActivity[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("activityLog.title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("activityLog.subtitle")}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي الأنشطة", value: mockActivities.length },
          { label: "اليوم", value: mockActivities.filter(a => {
            const diff = Date.now() - new Date(a.created_at).getTime();
            return diff < 86400000;
          }).length },
          { label: "المستخدمون النشطون", value: new Set(mockActivities.map(a => a.user)).size },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-foreground">{value}</div>
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
            placeholder={t("common.search")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="all">{t("common.all")} {t("activityLog.action")}</option>
          {ACTIVITY_TYPES.map(type => (
            <option key={type} value={type}>{t(`activityLog.types.${type}`)}</option>
          ))}
        </select>
        <select
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none"
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
        >
          <option value="all">{t("common.all")} {t("activityLog.user")}</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Activity Feed */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-muted-foreground">
          {t("activityLog.noActivities")}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateGroup, activities]) => (
            <div key={dateGroup}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                  {dateGroup}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2">
                {activities.map(activity => (
                  <div key={activity.id} className="bg-card border border-border rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md transition-all flex items-start gap-3">
                    {/* Type icon */}
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0", TYPE_COLORS[activity.type])}>
                      {TYPE_ICONS[activity.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {activity.action_ar}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            📌 {activity.entity_ar}
                          </p>
                          {activity.details_ar && (
                            <p className="text-xs text-muted-foreground/70 mt-1 bg-muted/40 rounded px-2 py-1 inline-block">
                              {activity.details_ar}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground/60 flex-shrink-0 whitespace-nowrap">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                          {activity.user.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-foreground">{activity.user}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{activity.user_role}</span>
                        <span className={cn("ms-auto text-xs px-2 py-0.5 rounded-full", TYPE_COLORS[activity.type])}>
                          {t(`activityLog.types.${activity.type}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
