import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard, Users, Star, FolderKanban, CheckSquare,
  Calendar, BarChart2, Menu, X, LogOut, Globe, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "dashboard", path: "/", icon: LayoutDashboard },
  { key: "clients", path: "/clients", icon: Users },
  { key: "influencers", path: "/influencers", icon: Star },
  { key: "projects", path: "/projects", icon: FolderKanban },
  { key: "tasks", path: "/tasks", icon: CheckSquare },
  { key: "calendar", path: "/calendar", icon: Calendar },
  { key: "reports", path: "/reports", icon: BarChart2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useLanguage();
  const { profile, signOut } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(path: string) {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate">{t("app.name")}</p>
              <p className="text-[10px] text-sidebar-foreground/50 leading-tight truncate">
                {t("app.tagline")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-2 font-semibold">
            {t("nav.dashboard")}
          </p>
          {navItems.map(({ key, path, icon: Icon }) => (
            <Link key={key} href={path}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive(path)
                    ? "bg-primary text-white shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {t(`nav.${key}`)}
              </a>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
          {/* Language switcher */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>{language === "en" ? "العربية" : "English"}</span>
          </button>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {t("nav.logout")}
          </button>

          {/* User info */}
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {/* Desktop language switcher in header */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
          >
            <Globe className="w-4 h-4" />
            {language === "en" ? "العربية" : "English"}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
