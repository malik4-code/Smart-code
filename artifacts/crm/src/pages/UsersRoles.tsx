import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  UserCog, Eye, EyeOff, Shield, CheckCircle2, XCircle,
  Users, Mail, BarChart2, ChevronDown, ChevronUp, Crown,
  Briefcase, Star, DollarSign, User, Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockTeamMembers, type MockTeamMember } from "../lib/enterpriseData";
import { useViewAs } from "../contexts/ViewAsContext";

type RoleKey = MockTeamMember["role"];

interface RolePermissions {
  icon: React.ReactNode;
  color: string;
  bg: string;
  hierarchy: number;
  canView: string[];
  canDo: string[];
  cannotDo: string[];
}

const ROLE_CONFIG: Record<RoleKey, RolePermissions> = {
  admin: {
    icon: <Crown className="w-4 h-4" />,
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/40",
    hierarchy: 1,
    canView: ["All pages and modules", "Full financial data and profit margins", "All client and campaign data", "User activity logs", "System settings"],
    canDo: ["Create, edit, and delete any record", "Manage users and roles", "View as any team member", "Export all data", "Configure system settings", "Approve any workflow"],
    cannotDo: [],
  },
  dept_manager: {
    icon: <Briefcase className="w-4 h-4" />,
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/40",
    hierarchy: 2,
    canView: ["Department campaigns and tasks", "Team performance and productivity", "Department-level financials", "Client profiles for assigned clients"],
    canDo: ["Approve campaign workflows", "Manage team assignments", "View department reports", "Add campaign notes"],
    cannotDo: ["Access full system financials", "Manage system settings", "View other departments' data", "Manage users"],
  },
  team_leader: {
    icon: <Star className="w-4 h-4" />,
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    hierarchy: 3,
    canView: ["Assigned campaigns", "Team tasks and deadlines", "Influencer lists for campaigns", "Campaign budgets (no margins)"],
    canDo: ["Create and assign tasks", "Update campaign stage", "Review influencer shortlists", "Add campaign notes", "Submit for approval"],
    cannotDo: ["Approve budgets", "Manage users", "View profit margins", "Delete campaigns"],
  },
  account_manager: {
    icon: <User className="w-4 h-4" />,
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    hierarchy: 4,
    canView: ["Assigned client profiles", "Client campaign history", "Campaign progress and stages", "Attachments and documents"],
    canDo: ["Update client info", "Create campaign requests", "Add notes to clients", "Upload attachments", "Send campaign updates to clients"],
    cannotDo: ["Approve campaigns", "View all financial data", "Manage other clients", "Manage users"],
  },
  influencer_specialist: {
    icon: <Star className="w-4 h-4" />,
    color: "text-pink-700 dark:text-pink-400",
    bg: "bg-pink-100 dark:bg-pink-900/40",
    hierarchy: 4,
    canView: ["Full influencer database", "Assigned campaigns", "Content calendar", "Influencer analytics"],
    canDo: ["Add and edit influencers", "Update influencer campaign status", "Track content delivery", "Add influencer notes"],
    cannotDo: ["View financials or margins", "Approve campaigns", "Manage users", "Access client portal"],
  },
  finance_user: {
    icon: <DollarSign className="w-4 h-4" />,
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/40",
    hierarchy: 3,
    canView: ["All financial records", "Invoices and payment status", "Budget usage per campaign", "Cost and profit reports"],
    canDo: ["Create and edit invoices", "Update payment status", "Export financial reports", "View all costs and margins"],
    cannotDo: ["Manage campaigns", "Manage users or roles", "Access client portal", "Approve campaign workflows"],
  },
  client_user: {
    icon: <Monitor className="w-4 h-4" />,
    color: "text-slate-700 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    hierarchy: 5,
    canView: ["Own company campaigns only", "Approved influencer shortlists", "Content previews pending approval", "Final campaign reports"],
    canDo: ["Approve or reject influencer lists", "Review and comment on content", "Download approved reports", "View campaign progress"],
    cannotDo: ["View other clients' data", "View costs or profit margins", "Manage any settings", "Access internal notes"],
  },
};

export default function UsersRoles() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { viewAs, startViewAs, stopViewAs } = useViewAs();
  const [expandedRole, setExpandedRole] = useState<RoleKey | null>(null);

  const roleGroups: { key: RoleKey; members: MockTeamMember[] }[] = (
    Object.keys(ROLE_CONFIG) as RoleKey[]
  )
    .sort((a, b) => ROLE_CONFIG[a].hierarchy - ROLE_CONFIG[b].hierarchy)
    .map(key => ({
      key,
      members: mockTeamMembers.filter(m => m.role === key),
    }))
    .filter(g => g.members.length > 0 || g.key === "client_user");

  const stats = [
    { label: t("usersRoles.totalUsers"), value: mockTeamMembers.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: t("roles.admin"), value: mockTeamMembers.filter(m => m.role === "admin").length, icon: Crown, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/40" },
    { label: t("roles.dept_manager"), value: mockTeamMembers.filter(m => m.role === "dept_manager").length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40" },
    { label: t("roles.account_manager"), value: mockTeamMembers.filter(m => m.role === "account_manager").length, icon: User, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40" },
  ];

  function handleViewAs(member: MockTeamMember) {
    if (viewAs?.member.id === member.id) {
      stopViewAs();
    } else {
      startViewAs(member);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("usersRoles.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("usersRoles.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <Shield className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{t("usersRoles.adminOnly")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {viewAs && (
        <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-amber-900 dark:text-amber-300">
                {t("viewAs.banner")} <span>{viewAs.member.name}</span>
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t(`roles.${viewAs.member.role}`)} · {isAr ? "بدأ منذ" : "Started"} {new Date(viewAs.startedAt).toLocaleTimeString(isAr ? "ar-SA" : "en-SA", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <button
            onClick={stopViewAs}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            {t("viewAs.exit")}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {roleGroups.map(({ key, members }) => {
          const cfg = ROLE_CONFIG[key];
          const isExpanded = expandedRole === key;
          return (
            <div key={key} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedRole(isExpanded ? null : key)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-start"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t(`roles.${key}`)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {members.length} {isAr ? "مستخدم" : members.length === 1 ? "user" : "users"} · {isAr ? "المستوى" : "Level"} {cfg.hierarchy}
                    </p>
                  </div>
                  {members.length > 0 && (
                    <div className="flex -space-x-2 rtl:space-x-reverse">
                      {members.slice(0, 3).map(m => (
                        <div key={m.id} className={cn("w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold", cfg.bg, cfg.color)}>
                          {m.avatar_initials.charAt(0)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", cfg.bg, cfg.color)}>
                    {cfg.canDo.length} {isAr ? "صلاحية" : "permissions"}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {members.length > 0 && (
                    <div className="p-5 border-b border-border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("usersRoles.teamMembers")}</h4>
                      <div className="space-y-2">
                        {members.map(member => (
                          <div key={member.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold", cfg.bg, cfg.color)}>
                                {member.avatar_initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{member.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="text-center">
                                  <div className="font-semibold text-foreground">{member.tasks_completed}</div>
                                  <div>{isAr ? "مهمة منجزة" : "tasks done"}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-foreground">{member.campaigns_active}</div>
                                  <div>{isAr ? "حملة نشطة" : "campaigns"}</div>
                                </div>
                                <div className="text-center">
                                  <div className={cn("font-semibold", member.productivity_score >= 90 ? "text-emerald-600" : member.productivity_score >= 75 ? "text-amber-600" : "text-red-600")}>
                                    {member.productivity_score}%
                                  </div>
                                  <div>{isAr ? "إنتاجية" : "productivity"}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewAs(member)}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                                  viewAs?.member.id === member.id
                                    ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
                                    : "text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                                )}
                              >
                                {viewAs?.member.id === member.id ? (
                                  <><EyeOff className="w-3.5 h-3.5" />{t("viewAs.exit")}</>
                                ) : (
                                  <><Eye className="w-3.5 h-3.5" />{t("usersRoles.viewAs")}</>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5" />
                        {t("usersRoles.canView")}
                      </h4>
                      <ul className="space-y-1.5">
                        {cfg.canView.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("usersRoles.canDo")}
                      </h4>
                      <ul className="space-y-1.5">
                        {cfg.canDo.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {cfg.cannotDo.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          {t("usersRoles.cannotDo")}
                        </h4>
                        <ul className="space-y-1.5">
                          {cfg.cannotDo.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
