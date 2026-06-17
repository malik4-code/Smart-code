import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useViewAs } from "../contexts/ViewAsContext";
import {
  LayoutDashboard, Users, Star, CheckSquare,
  Calendar, BarChart2, Menu, X, LogOut, Globe, TrendingUp,
  Megaphone, DollarSign, FileText, Activity, CheckCircle2,
  Bell, ChevronRight, UserCog, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockNotifications } from "../lib/enterpriseData";

const navGroups = [
  {
    key: "main",
    items: [
      { key: "dashboard", path: "/", icon: LayoutDashboard },
    ],
  },
  {
    key: "operations",
    items: [
      { key: "clients", path: "/clients", icon: Users },
      { key: "campaigns", path: "/campaigns", icon: Megaphone },
      { key: "influencers", path: "/influencers", icon: Star },
      { key: "calendar", path: "/calendar", icon: Calendar },
    ],
  },
  {
    key: "management",
    items: [
      { key: "tasks", path: "/tasks", icon: CheckSquare },
      { key: "approvals", path: "/approvals", icon: CheckCircle2 },
    ],
  },
  {
    key: "admin",
    items: [
      { key: "finance", path: "/finance", icon: DollarSign },
      { key: "reports", path: "/reports", icon: BarChart2 },
      { key: "documents", path: "/documents", icon: FileText },
      { key: "activityLog", path: "/activity", icon: Activity },
      { key: "usersRoles", path: "/users-roles", icon: UserCog },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useLanguage();
  const { profile, signOut } = useAuth();
  const { viewAs, stopViewAs } = useViewAs();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  function isActive(path: string) {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  }

  function formatTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return t("common.justNow");
    if (h < 24) return `${h} ${t("common.hoursAgo")}`;
    return `${Math.floor(h / 24)} ${t("common.daysAgo")}`;
  }

  const notifTypeIcons: Record<string, string> = {
    approval: "✅", task: "📋", deadline: "⚠️", client: "💼", system: "🔔",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 z-50 flex flex-col w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out flex-shrink-0",
          isRTL ? "right-0" : "left-0",
          sidebarOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate">{t("app.name")}</p>
              <p className="text-[10px] text-sidebar-foreground/50 leading-tight truncate">{t("app.tagline")}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-sidebar-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={group.key} className={cn(gi > 0 ? "mt-3" : "")}>
              {group.key !== "main" && (
                <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-1.5 font-semibold">
                  {t(`nav.${group.key}`)}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ key, path, icon: Icon }) => (
                  <Link
                    key={key}
                    href={path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive(path)
                        ? "bg-primary text-white shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1">{t(`nav.${key}`)}</span>
                    {key === "approvals" && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                        3
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>{language === "en" ? "العربية" : "English"}</span>
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {t("nav.logout")}
          </button>
          {profile && (
            <div className="mt-2 px-3 py-2.5 rounded-lg bg-sidebar-accent">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">
                    {profile.full_name || profile.email}
                  </p>
                  <p className="text-[10px] text-sidebar-accent-foreground/60 capitalize">
                    {t(`roles.${profile.role}`)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />

          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
          >
            <Globe className="w-4 h-4" />
            {language === "en" ? "العربية" : "English"}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 end-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute end-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm">{t("notifications.title")}</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                      {t("notifications.markAllRead")}
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {t("notifications.noNotifications")}
                    </div>
                  ) : notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={cn(
                        "px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors",
                        !notif.is_read && "bg-primary/5"
                      )}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{notifTypeIcons[notif.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-xs font-medium leading-snug", !notif.is_read && "text-foreground font-semibold")}>
                            {notif.title_ar}
                          </p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body_ar}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{formatTime(notif.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-border">
                    <Link
                      href="/activity"
                      className="text-xs text-primary hover:underline flex items-center gap-1 justify-center"
                      onClick={() => setNotifOpen(false)}
                    >
                      {t("notifications.viewAll")}
                      <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {viewAs && (
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span>
                {t("viewAs.banner")} <strong>{viewAs.member.name}</strong>
                <span className="font-normal opacity-80"> — {t(`roles.${viewAs.member.role}`)}</span>
              </span>
            </div>
            <button
              onClick={stopViewAs}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium transition-colors flex-shrink-0 border border-white/30"
            >
              {t("viewAs.exit")}
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
