import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus, Search, Pencil, Trash2, X, Filter, SlidersHorizontal, ChevronDown,
  Star, StarOff, AlertTriangle, Check, Camera, Building2, Phone, Mail,
  CreditCard, MapPin, ChevronRight, ChevronLeft, ExternalLink, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockInfluencers } from "../lib/mockData";

// ─── Platform Icons ───────────────────────────────────────────────────────────
function PlatformIcon({ platform, size = 20 }: { platform: string; size?: number }) {
  const s = size;
  const icons: Record<string, React.ReactNode> = {
    instagram: (<svg width={s} height={s} viewBox="0 0 24 24"><defs><linearGradient id="igG" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F9CE34"/><stop offset="33%" stopColor="#EE2A7B"/><stop offset="100%" stopColor="#6228D7"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#igG)"/><circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/><circle cx="17.5" cy="6.5" r="1.2" fill="white"/></svg>),
    tiktok:    (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#010101"/><path fill="#EE1D52" d="M16.8 9.3a5.7 5.7 0 0 1-2.3-.5v5.6a3.8 3.8 0 1 1-3.8-3.8c.2 0 .4 0 .6.1V12a2 2 0 1 0 2 2V6h2c.1.7.4 1.3.8 1.8.6.7 1.5 1.1 2.5 1.2v1.8a5.6 5.6 0 0 1-1.8-.5z"/><path fill="#69C9D0" d="M15 8.8a5.7 5.7 0 0 0 2.3.5V7.5c-.5-.1-1-.4-1.5-.8A3.6 3.6 0 0 1 15 4.7h-2v13.3a2 2 0 0 1-2 1.7 2 2 0 0 1-2-2 2 2 0 0 1 2-2c.2 0 .4 0 .6.1v-1.9a3.8 3.8 0 0 0-.6-.1 3.8 3.8 0 0 0-3.8 3.8 3.8 3.8 0 0 0 3.8 3.8 3.8 3.8 0 0 0 3.8-3.8V9.3A5.6 5.6 0 0 0 17 9.8V8c-.4 0-.8-.1-1.1-.2l-.9.2z"/></svg>),
    snapchat:  (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#FFFC00"/><path fill="#000" d="M12 4c-1.9 0-3.5 1.3-3.5 3.7v.6c-.3-.1-.7-.2-1-.1-.6.1-1 .5-.9 1 0 .3.3.5.7.7-.2.4-.6.7-1.3.9-.2.1-.3.3-.2.5.2.6 1 .9 2.4 1.2 0 .1.1.2.1.3.1.3.5.5 1.1.5h.1c.3.3.8.5 1.5.5s1.2-.2 1.5-.5h.1c.6 0 1-.2 1.1-.5 0-.1.1-.2.1-.3 1.4-.3 2.2-.6 2.4-1.2.1-.2 0-.4-.2-.5-.7-.2-1.1-.5-1.3-.9.4-.2.7-.4.7-.7.1-.5-.3-.9-.9-1-.3-.1-.7 0-1 .1v-.6C15.5 5.3 13.9 4 12 4z"/></svg>),
    x:         (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#000"/><path fill="white" d="M13.6 10.9 17.8 6h-1l-3.6 4.2L10.2 6H6.4l4.4 6.4L6.4 18h1l3.8-4.4 3 4.4h3.8l-4.4-6.1zm-1.3 1.6-.4-.6-3.4-4.9H9.8l2.8 4 .4.6 3.6 5.1H14l-1.7-4.2z"/></svg>),
    youtube:   (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#FF0000"/><path fill="white" d="M20 8.8a2.3 2.3 0 0 0-1.6-1.6C17 6.9 12 6.9 12 6.9s-5 0-6.4.3A2.3 2.3 0 0 0 4 8.8 24 24 0 0 0 4 12a24 24 0 0 0 .3 3.2 2.3 2.3 0 0 0 1.6 1.6c1.4.3 6.4.3 6.4.3s5 0 6.4-.3a2.3 2.3 0 0 0 1.6-1.6A24 24 0 0 0 20.3 12 24 24 0 0 0 20 8.8z"/><polygon fill="white" points="10.2,14.5 14.5,12 10.2,9.5"/></svg>),
    facebook:  (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1877F2"/><path fill="white" d="M16 12h-2.7v8h-3v-8H8V9.3h2.3V7.6c0-2.3 1.4-3.6 3.5-3.6.7 0 1.5.1 2.2.2v2.4h-1.2c-1.2 0-1.5.6-1.5 1.4v1.3H16L15.4 12z"/></svg>),
    linkedin:  (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#0A66C2"/><path fill="white" d="M7 9.5h2.5V17H7V9.5zm1.25-4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM11 9.5h2.4v1h.1c.3-.6 1.1-1.2 2.3-1.2 2.5 0 3 1.6 3 3.7V17h-2.5v-3.5c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.8V17H11V9.5z"/></svg>),
    twitter:   (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#1D9BF0"/><path fill="white" d="M18.2 8.5c-.5.2-1 .3-1.5.4.5-.3.9-.8 1.1-1.4-.5.3-1 .5-1.6.6a2.6 2.6 0 0 0-4.4 2.4 7.3 7.3 0 0 1-5.3-2.7 2.6 2.6 0 0 0 .8 3.4c-.4 0-.8-.1-1.2-.3v.1A2.6 2.6 0 0 0 8.2 13c-.4.1-.8.1-1.2 0a2.6 2.6 0 0 0 2.4 1.8 5.2 5.2 0 0 1-3.9.9 7.3 7.3 0 0 0 11.3-6.1V9.3c.5-.4.9-.9 1.4-1.4l-.1.6z"/></svg>),
    other:     (<svg width={s} height={s} viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#6B7280"/><circle cx="12" cy="12" r="4" fill="white" opacity="0.6"/></svg>),
  };
  return <span className="flex-shrink-0">{icons[platform] || icons["other"]}</span>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface InfluencerPlatformEntry {
  id: string;
  platform: string;
  username: string;
  profile_link: string;
  followers: number | null;
  avg_views: number | null;
  engagement_rate: number | null;
  cost_price: number | null;
  selling_price: number | null;
  notes: string;
}

interface EnterpriseInfluencer {
  id: string;
  name: string;
  gender: "male" | "female" | null;
  category: string | null;
  city: string | null;
  country: string;
  shows_face: boolean;
  has_license: boolean;
  is_favorite: boolean;
  is_blacklisted: boolean;
  email: string | null;
  phone: string | null;
  notes: string | null;
  accounting_code: string | null;
  campaign_rating: number | null;
  platforms: InfluencerPlatformEntry[];
  bank_name: string | null;
  account_holder: string | null;
  iban: string | null;
  tags: string[];
}

function toEnterprise(inf: any): EnterpriseInfluencer {
  return {
    id: inf.id, name: inf.name, gender: null, category: inf.category || null,
    city: inf.city || null, country: "SA", shows_face: true, has_license: false,
    is_favorite: false, is_blacklisted: false, email: inf.email || null, phone: inf.phone || null,
    notes: inf.notes || null, accounting_code: null, campaign_rating: null,
    platforms: [{
      id: `pl-${inf.id}`, platform: inf.platform || "instagram",
      username: "@" + (inf.name || "").replace(/\s/g, "").toLowerCase(),
      profile_link: "", followers: inf.followers || null, avg_views: null,
      engagement_rate: inf.engagement_rate || null, cost_price: null,
      selling_price: inf.estimated_price || null, notes: "",
    }],
    bank_name: null, account_holder: null, iban: null, tags: [],
  };
}

const PLATFORMS = ["instagram", "tiktok", "snapchat", "x", "youtube", "facebook", "linkedin", "twitter", "other"];
const CATEGORIES = ["lifestyle", "fashion", "food", "tech", "beauty", "fitness", "travel", "business", "education", "entertainment", "sports", "gaming", "other"];
const STEPS_INF = ["basic", "platforms", "location", "banking"] as const;
type StepInf = typeof STEPS_INF[number];

function fmtFollowers(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function emptyPlatform(): InfluencerPlatformEntry {
  return { id: `pl-${Date.now()}`, platform: "instagram", username: "", profile_link: "", followers: null, avg_views: null, engagement_rate: null, cost_price: null, selling_price: null, notes: "" };
}

function emptyInfluencer(): EnterpriseInfluencer {
  return {
    id: "", name: "", gender: null, category: null, city: null, country: "SA",
    shows_face: true, has_license: false, is_favorite: false, is_blacklisted: false,
    email: null, phone: null, notes: null, accounting_code: null, campaign_rating: null,
    platforms: [emptyPlatform()],
    bank_name: null, account_holder: null, iban: null, tags: [],
  };
}

export default function Influencers() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [influencers, setInfluencers] = useState<EnterpriseInfluencer[]>(() => mockInfluencers.map(toEnterprise));
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    platform: "all", gender: "all", category: "all", city: "",
    minFollowers: "", maxFollowers: "", minEngagement: "", maxEngagement: "",
    showsFace: "all", hasLicense: "all", isFavorite: false, isBlacklisted: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EnterpriseInfluencer | null>(null);
  const [form, setForm] = useState<EnterpriseInfluencer>(emptyInfluencer());
  const [currentStep, setCurrentStep] = useState<StepInf>("basic");
  const [saving, setSaving] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [error, setError] = useState("");

  function openAdd() {
    setEditing(null); setForm(emptyInfluencer()); setCurrentStep("basic");
    setError(""); setDialogOpen(true); setExpandedPlatform(null);
  }

  function openEdit(inf: EnterpriseInfluencer) {
    setEditing(inf); setForm({ ...inf, platforms: inf.platforms.map(p => ({ ...p })) });
    setCurrentStep("basic"); setError(""); setDialogOpen(true); setExpandedPlatform(null);
  }

  function handleSave() {
    if (!form.name.trim()) { setError(isAr ? "الاسم مطلوب" : "Name is required"); return; }
    setSaving(true);
    setTimeout(() => {
      const inf: EnterpriseInfluencer = { ...form, id: editing?.id || `inf-${Date.now()}` };
      if (editing) {
        setInfluencers(c => c.map(i => i.id === editing.id ? inf : i));
      } else {
        setInfluencers(c => [inf, ...c]);
      }
      setSaving(false); setDialogOpen(false);
    }, 400);
  }

  function addPlatform() {
    const p = emptyPlatform();
    setForm(f => ({ ...f, platforms: [...f.platforms, p] }));
    setExpandedPlatform(p.id);
  }

  function removePlatform(id: string) {
    setForm(f => ({ ...f, platforms: f.platforms.filter(p => p.id !== id) }));
  }

  function updatePlatform(id: string, field: keyof InfluencerPlatformEntry, value: string | number | null) {
    setForm(f => ({ ...f, platforms: f.platforms.map(p => p.id === id ? { ...p, [field]: value } : p) }));
  }

  const filtered = influencers.filter(inf => {
    const q = search.toLowerCase();
    const matchSearch = !q || inf.name.toLowerCase().includes(q) ||
      inf.platforms.some(p => p.username.toLowerCase().includes(q)) ||
      (inf.accounting_code || "").toLowerCase().includes(q) ||
      (inf.phone || "").includes(q) ||
      (inf.city || "").toLowerCase().includes(q);
    const matchPlatform = filters.platform === "all" || inf.platforms.some(p => p.platform === filters.platform);
    const matchGender = filters.gender === "all" || inf.gender === filters.gender;
    const matchCategory = filters.category === "all" || inf.category === filters.category;
    const matchCity = !filters.city || (inf.city || "").toLowerCase().includes(filters.city.toLowerCase());
    const totalFollowers = inf.platforms.reduce((s, p) => s + (p.followers || 0), 0);
    const matchMinF = !filters.minFollowers || totalFollowers >= Number(filters.minFollowers);
    const matchMaxF = !filters.maxFollowers || totalFollowers <= Number(filters.maxFollowers);
    const avgEng = inf.platforms.filter(p => p.engagement_rate).reduce((s, p, _, a) => s + (p.engagement_rate || 0) / a.length, 0);
    const matchMinE = !filters.minEngagement || avgEng >= Number(filters.minEngagement);
    const matchMaxE = !filters.maxEngagement || avgEng <= Number(filters.maxEngagement);
    const matchFace = filters.showsFace === "all" || (filters.showsFace === "yes" ? inf.shows_face : !inf.shows_face);
    const matchLicense = filters.hasLicense === "all" || (filters.hasLicense === "yes" ? inf.has_license : !inf.has_license);
    const matchFav = !filters.isFavorite || inf.is_favorite;
    const matchBlack = !filters.isBlacklisted || inf.is_blacklisted;
    return matchSearch && matchPlatform && matchGender && matchCategory && matchCity &&
      matchMinF && matchMaxF && matchMinE && matchMaxE && matchFace && matchLicense && matchFav && matchBlack;
  });

  const activeFilterCount = [
    filters.platform !== "all", filters.gender !== "all", filters.category !== "all",
    filters.city, filters.minFollowers, filters.maxFollowers, filters.minEngagement, filters.maxEngagement,
    filters.showsFace !== "all", filters.hasLicense !== "all", filters.isFavorite, filters.isBlacklisted,
  ].filter(Boolean).length;

  const stepIdx = STEPS_INF.indexOf(currentStep);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("influencers.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("influencers.subtitle")}</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />{t("influencers.addInfluencer")}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? "البحث بالاسم، المعرف، الرقم، كود المحاسبة..." : "Search by name, username, phone, accounting code..."}
            className="w-full h-10 ps-9 pe-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={cn("flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-colors",
            showFilters || activeFilterCount > 0 ? "bg-primary text-white border-primary" : "border-border hover:bg-muted")}>
          <SlidersHorizontal className="w-4 h-4" />
          {isAr ? "فلاتر متقدمة" : "Advanced Filters"}
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
        <span className="flex items-center text-xs text-muted-foreground h-10 px-2">
          {filtered.length} / {influencers.length} {isAr ? "مؤثر" : "influencers"}
        </span>
      </div>

      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">{isAr ? "فلاتر متقدمة" : "Advanced Filters"}</p>
            <button onClick={() => setFilters({ platform: "all", gender: "all", category: "all", city: "", minFollowers: "", maxFollowers: "", minEngagement: "", maxEngagement: "", showsFace: "all", hasLicense: "all", isFavorite: false, isBlacklisted: false })}
              className="text-xs text-muted-foreground hover:text-foreground">{isAr ? "مسح الكل" : "Clear All"}</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">{t("influencers.platform")}</label>
              <select value={filters.platform} onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))} className={fic}>
                <option value="all">{t("common.all")}</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{t(`influencers.platforms.${p}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("influencers.category")}</label>
              <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className={fic}>
                <option value="all">{t("common.all")}</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{t(`influencers.categories.${c}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("influencers.gender") || "Gender"}</label>
              <select value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))} className={fic}>
                <option value="all">{t("common.all")}</option>
                <option value="male">{t("influencers.genders.male")}</option>
                <option value="female">{t("influencers.genders.female")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("influencers.city")}</label>
              <input value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} className={fic} placeholder={isAr ? "المدينة..." : "City..."} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isAr ? "متابعين من" : "Followers from"}</label>
              <input type="number" value={filters.minFollowers} onChange={e => setFilters(f => ({ ...f, minFollowers: e.target.value }))} className={fic} dir="ltr" placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isAr ? "متابعين حتى" : "Followers to"}</label>
              <input type="number" value={filters.maxFollowers} onChange={e => setFilters(f => ({ ...f, maxFollowers: e.target.value }))} className={fic} dir="ltr" placeholder="∞" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isAr ? "تفاعل من %" : "Engagement from %"}</label>
              <input type="number" step="0.1" value={filters.minEngagement} onChange={e => setFilters(f => ({ ...f, minEngagement: e.target.value }))} className={fic} dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isAr ? "تفاعل حتى %" : "Engagement to %"}</label>
              <input type="number" step="0.1" value={filters.maxEngagement} onChange={e => setFilters(f => ({ ...f, maxEngagement: e.target.value }))} className={fic} dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isAr ? "يظهر الوجه" : "Shows Face"}</label>
              <select value={filters.showsFace} onChange={e => setFilters(f => ({ ...f, showsFace: e.target.value }))} className={fic}>
                <option value="all">{t("common.all")}</option>
                <option value="yes">{t("common.yes")}</option>
                <option value="no">{t("common.no")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isAr ? "لديه ترخيص" : "Has License"}</label>
              <select value={filters.hasLicense} onChange={e => setFilters(f => ({ ...f, hasLicense: e.target.value }))} className={fic}>
                <option value="all">{t("common.all")}</option>
                <option value="yes">{t("common.yes")}</option>
                <option value="no">{t("common.no")}</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer pb-1">
                <input type="checkbox" checked={filters.isFavorite} onChange={e => setFilters(f => ({ ...f, isFavorite: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-xs">{isAr ? "المفضلة فقط" : "Favorites only"}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer pb-1">
                <input type="checkbox" checked={filters.isBlacklisted} onChange={e => setFilters(f => ({ ...f, isBlacklisted: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-xs">{isAr ? "المحظورون" : "Blacklisted"}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  t("influencers.name"), isAr ? "المنصات" : "Platforms",
                  t("influencers.category"), t("influencers.city"),
                  isAr ? "إجمالي المتابعين" : "Total Followers",
                  isAr ? "متوسط التفاعل" : "Avg Engagement",
                  isAr ? "سعر البيع" : "Selling Price",
                  isAr ? "الحالة" : "Status", t("common.actions")
                ].map((h, i) => (
                  <th key={i} className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">{t("influencers.noInfluencers")}</td></tr>
              ) : filtered.map(inf => {
                const totalFollowers = inf.platforms.reduce((s, p) => s + (p.followers || 0), 0);
                const avgEngagement = inf.platforms.filter(p => p.engagement_rate).length > 0
                  ? inf.platforms.filter(p => p.engagement_rate).reduce((s, p, _, a) => s + (p.engagement_rate || 0) / a.length, 0) : null;
                const maxPrice = Math.max(...inf.platforms.map(p => p.selling_price || 0));
                return (
                  <tr key={inf.id} className={cn("hover:bg-muted/30 transition-colors",
                    inf.is_blacklisted && "opacity-60 bg-red-50/30 dark:bg-red-950/10")}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{inf.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold">{inf.name}</p>
                            {inf.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                            {inf.is_blacklisted && <AlertTriangle className="w-3 h-3 text-red-500" />}
                          </div>
                          {inf.accounting_code && <p className="text-xs text-muted-foreground font-mono">{inf.accounting_code}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {inf.platforms.map(p => (
                          <span key={p.id} title={`${p.platform}: ${p.username || "—"} · ${fmtFollowers(p.followers)}`}>
                            <PlatformIcon platform={p.platform} size={22} />
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {inf.category ? t(`influencers.categories.${inf.category}`) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">{inf.city || "—"}</td>
                    <td className="px-4 py-3.5 font-medium">{fmtFollowers(totalFollowers)}</td>
                    <td className="px-4 py-3.5">{avgEngagement ? `${avgEngagement.toFixed(1)}%` : "—"}</td>
                    <td className="px-4 py-3.5">{maxPrice > 0 ? `${maxPrice.toLocaleString()} ${t("common.sar")}` : "—"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        {inf.has_license && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-medium dark:bg-blue-950/40 dark:text-blue-300">{isAr ? "مرخص" : "Licensed"}</span>}
                        {inf.shows_face && <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium dark:bg-green-950/40 dark:text-green-300">{isAr ? "يظهر وجهه" : "Shows Face"}</span>}
                        {inf.is_blacklisted && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-medium dark:bg-red-950/40 dark:text-red-300">{isAr ? "محظور" : "Blacklisted"}</span>}
                        {!inf.has_license && !inf.shows_face && !inf.is_blacklisted && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setInfluencers(c => c.map(i => i.id === inf.id ? { ...i, is_favorite: !i.is_favorite } : i))}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-500 transition-colors">
                          {inf.is_favorite ? <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => openEdit(inf)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(inf.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">{t("common.showing")} {filtered.length} {t("common.results")}</div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-base">{editing ? t("influencers.editInfluencer") : t("influencers.addInfluencer")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[isAr ? "المعلومات الأساسية" : "Basic Info", isAr ? "المنصات" : "Platforms", isAr ? "العنوان" : "Address", isAr ? "البنك" : "Banking"][stepIdx]}
                  {" · "}{isAr ? `${stepIdx + 1} من 4` : `${stepIdx + 1} of 4`}
                </p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="px-5 pt-4 flex-shrink-0">
              <div className="flex items-center gap-0 mb-4">
                {STEPS_INF.map((step, idx) => {
                  const done = idx < stepIdx; const active = idx === stepIdx;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                        done ? "bg-primary text-white" : active ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted text-muted-foreground")}>
                        {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      {idx < STEPS_INF.length - 1 && <div className={cn("flex-1 h-0.5 mx-1 transition-colors", done ? "bg-primary" : "bg-muted")} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-950/30 dark:text-red-400">{error}</div>}

              {currentStep === "basic" && (
                <div className="space-y-4">
                  <FI label={`${t("influencers.name")} *`}>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={ic} />
                  </FI>
                  <div className="grid grid-cols-3 gap-3">
                    <FI label={t("influencers.gender")}>
                      <select value={form.gender || ""} onChange={e => setForm(f => ({ ...f, gender: e.target.value as any || null }))} className={ic}>
                        <option value="">{t("common.select")}</option>
                        <option value="male">{t("influencers.genders.male")}</option>
                        <option value="female">{t("influencers.genders.female")}</option>
                      </select>
                    </FI>
                    <FI label={t("influencers.category")}>
                      <select value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value || null }))} className={ic}>
                        <option value="">{t("common.select")}</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{t(`influencers.categories.${c}`)}</option>)}
                      </select>
                    </FI>
                    <FI label={isAr ? "كود المحاسبة" : "Accounting Code"}>
                      <input value={form.accounting_code || ""} onChange={e => setForm(f => ({ ...f, accounting_code: e.target.value || null }))} className={ic} dir="ltr" />
                    </FI>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FI label={t("influencers.phone")}>
                      <div className="relative"><Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value || null }))} className={cn(ic, "ps-9")} dir="ltr" /></div>
                    </FI>
                    <FI label={t("influencers.email")}>
                      <input type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value || null }))} className={ic} dir="ltr" />
                    </FI>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { key: "shows_face" as const, label_en: "Shows Face", label_ar: "يظهر وجهه" },
                      { key: "has_license" as const, label_en: "Has License", label_ar: "لديه ترخيص" },
                      { key: "is_favorite" as const, label_en: "Favorite", label_ar: "مفضل" },
                      { key: "is_blacklisted" as const, label_en: "Blacklisted", label_ar: "محظور" },
                    ].map(({ key, label_en, label_ar }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 rounded" />
                        <span className="text-xs font-medium">{isAr ? label_ar : label_en}</span>
                      </label>
                    ))}
                  </div>
                  <FI label={t("influencers.notes")}>
                    <textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))}
                      rows={3} className={cn(ic, "h-auto py-2 resize-none")} />
                  </FI>
                </div>
              )}

              {currentStep === "platforms" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{isAr ? "أضف جميع منصات المؤثر — لكل منصة بياناتها الخاصة" : "Add all influencer platforms — each platform has its own data"}</p>
                    <button onClick={addPlatform}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                      <Plus className="w-3.5 h-3.5" />{isAr ? "إضافة منصة" : "Add Platform"}
                    </button>
                  </div>
                  {form.platforms.map((p, idx) => (
                    <div key={p.id} className="border border-border rounded-xl overflow-hidden">
                      <div
                        onClick={() => setExpandedPlatform(expandedPlatform === p.id ? null : p.id)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <PlatformIcon platform={p.platform} size={22} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm capitalize">{t(`influencers.platforms.${p.platform}`)}</p>
                          <p className="text-xs text-muted-foreground">{p.username || (isAr ? "لم يُحدد المعرف" : "No username set")} · {fmtFollowers(p.followers)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {form.platforms.length > 1 && (
                            <button onClick={e => { e.stopPropagation(); removePlatform(p.id); }}
                              className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors dark:hover:bg-red-950/30">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedPlatform === p.id && "rotate-180")} />
                        </div>
                      </div>
                      {expandedPlatform === p.id && (
                        <div className="px-4 pb-4 pt-1 border-t border-border space-y-3 bg-muted/10">
                          <div className="grid grid-cols-2 gap-3">
                            <FI label={t("influencers.platform")}>
                              <div className="flex items-center gap-2">
                                <PlatformIcon platform={p.platform} size={18} />
                                <select value={p.platform} onChange={e => updatePlatform(p.id, "platform", e.target.value)} className={cn(ic, "flex-1")}>
                                  {PLATFORMS.map(pl => <option key={pl} value={pl}>{t(`influencers.platforms.${pl}`)}</option>)}
                                </select>
                              </div>
                            </FI>
                            <FI label={isAr ? "المعرف / اليوزرنيم" : "Username"}>
                              <input value={p.username} onChange={e => updatePlatform(p.id, "username", e.target.value)} className={ic} dir="ltr" placeholder="@username" />
                            </FI>
                            <FI label={isAr ? "رابط الحساب" : "Profile Link"}>
                              <div className="relative"><ExternalLink className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input value={p.profile_link} onChange={e => updatePlatform(p.id, "profile_link", e.target.value)} className={cn(ic, "ps-8")} dir="ltr" placeholder="https://" />
                              </div>
                            </FI>
                            <FI label={t("influencers.followers")}>
                              <input type="number" value={p.followers ?? ""} onChange={e => updatePlatform(p.id, "followers", e.target.value ? Number(e.target.value) : null)} className={ic} dir="ltr" />
                            </FI>
                            <FI label={isAr ? "متوسط المشاهدات" : "Avg Views"}>
                              <input type="number" value={p.avg_views ?? ""} onChange={e => updatePlatform(p.id, "avg_views", e.target.value ? Number(e.target.value) : null)} className={ic} dir="ltr" />
                            </FI>
                            <FI label={t("influencers.engagementRate")}>
                              <input type="number" step="0.01" value={p.engagement_rate ?? ""} onChange={e => updatePlatform(p.id, "engagement_rate", e.target.value ? Number(e.target.value) : null)} className={ic} dir="ltr" />
                            </FI>
                            <FI label={isAr ? "سعر التكلفة (ر.س)" : "Cost Price (SAR)"}>
                              <input type="number" value={p.cost_price ?? ""} onChange={e => updatePlatform(p.id, "cost_price", e.target.value ? Number(e.target.value) : null)} className={ic} dir="ltr" />
                            </FI>
                            <FI label={isAr ? "سعر البيع للعميل (ر.س)" : "Selling Price to Client (SAR)"}>
                              <input type="number" value={p.selling_price ?? ""} onChange={e => updatePlatform(p.id, "selling_price", e.target.value ? Number(e.target.value) : null)} className={ic} dir="ltr" />
                            </FI>
                          </div>
                          <FI label={isAr ? "ملاحظات المنصة" : "Platform Notes"}>
                            <textarea value={p.notes} onChange={e => updatePlatform(p.id, "notes", e.target.value)}
                              rows={2} className={cn(ic, "h-auto py-2 resize-none")} />
                          </FI>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentStep === "location" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FI label={isAr ? "الدولة" : "Country"}>
                      <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className={ic} />
                    </FI>
                    <FI label={t("influencers.city")}>
                      <input value={form.city || ""} onChange={e => setForm(f => ({ ...f, city: e.target.value || null }))} className={ic} />
                    </FI>
                  </div>
                  <p className="text-xs text-muted-foreground">{isAr ? "عنوان الشحن (للجوائز والهدايا)" : "Shipping address (for prizes & gifts)"}</p>
                </div>
              )}

              {currentStep === "banking" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                    {isAr ? "هذه المعلومات حساسة — تُحفظ بصلاحيات خاصة ولا تظهر للجميع" : "This information is sensitive — stored with restricted access, not visible to all users"}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FI label={isAr ? "اسم البنك" : "Bank Name"}>
                      <select value={form.bank_name || ""} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value || null }))} className={ic}>
                        <option value="">{t("common.select")}</option>
                        {["Al Rajhi Bank", "Al Ahli Bank", "Riyad Bank", "SABB", "Saudi Fransi", "Alinma Bank", "BSF", "Other"].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </FI>
                    <FI label={isAr ? "اسم صاحب الحساب" : "Account Holder Name"}>
                      <input value={form.account_holder || ""} onChange={e => setForm(f => ({ ...f, account_holder: e.target.value || null }))} className={ic} />
                    </FI>
                    <FI label="IBAN">
                      <input value={form.iban || ""} onChange={e => setForm(f => ({ ...f, iban: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24) || null }))}
                        className={ic} dir="ltr" placeholder="SA..." />
                    </FI>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex items-center justify-between">
              <button
                onClick={stepIdx === 0 ? () => setDialogOpen(false) : () => { setCurrentStep(STEPS_INF[stepIdx - 1]); setError(""); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                {stepIdx === 0 ? <><X className="w-4 h-4" />{t("common.cancel")}</> : <><ChevronLeft className="w-4 h-4 rtl:rotate-180" />{t("common.previous")}</>}
              </button>
              {stepIdx < STEPS_INF.length - 1 ? (
                <button onClick={() => { setCurrentStep(STEPS_INF[stepIdx + 1]); setError(""); }}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {t("common.next")}<ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{isAr ? "جاري الحفظ..." : "Saving..."}</> : <><Check className="w-4 h-4" />{t("common.save")}</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-semibold mb-2">{t("common.confirmDeleteTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-5">{t("influencers.confirmDelete")}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">{t("common.cancel")}</button>
              <button onClick={() => { setInfluencers(c => c.filter(i => i.id !== deleteId)); setDeleteId(null); }}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ic = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
const fic = "mt-1 w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
function FI({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="block text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}
