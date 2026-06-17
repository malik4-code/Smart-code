import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Influencer } from "../lib/supabase";
import { mockInfluencers } from "../lib/mockData";

function PlatformIcon({ platform, size = 18 }: { platform: string; size?: number }) {
  const s = size;
  const icons: Record<string, React.ReactNode> = {
    instagram: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F9CE34"/>
            <stop offset="33%" stopColor="#EE2A7B"/>
            <stop offset="100%" stopColor="#6228D7"/>
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#ig)"/>
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
        <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
      </svg>
    ),
    tiktok: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#010101"/>
        <path fill="#EE1D52" d="M16.8 9.3a5.7 5.7 0 0 1-2.3-.5v5.6a3.8 3.8 0 1 1-3.8-3.8c.2 0 .4 0 .6.1V12a2 2 0 1 0 2 2V6h2c.1.7.4 1.3.8 1.8.6.7 1.5 1.1 2.5 1.2v1.8a5.6 5.6 0 0 1-1.8-.5z"/>
        <path fill="#69C9D0" d="M15 8.8a5.7 5.7 0 0 0 2.3.5V7.5c-.5-.1-1-.4-1.5-.8A3.6 3.6 0 0 1 15 4.7h-2v13.3a2 2 0 0 1-2 1.7 2 2 0 0 1-2-2 2 2 0 0 1 2-2c.2 0 .4 0 .6.1v-1.9a3.8 3.8 0 0 0-.6-.1 3.8 3.8 0 0 0-3.8 3.8 3.8 3.8 0 0 0 3.8 3.8 3.8 3.8 0 0 0 3.8-3.8V9.3A5.6 5.6 0 0 0 17 9.8V8c-.4 0-.8-.1-1.1-.2l-.9.2z"/>
      </svg>
    ),
    snapchat: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#FFFC00"/>
        <path fill="#000" d="M12 4c-1.9 0-3.5 1.3-3.5 3.7v.6c-.3-.1-.7-.2-1-.1-.6.1-1 .5-.9 1 0 .3.3.5.7.7-.2.4-.6.7-1.3.9-.2.1-.3.3-.2.5.2.6 1 .9 2.4 1.2 0 .1.1.2.1.3.1.3.5.5 1.1.5h.1c.3.3.8.5 1.5.5s1.2-.2 1.5-.5h.1c.6 0 1-.2 1.1-.5 0-.1.1-.2.1-.3 1.4-.3 2.2-.6 2.4-1.2.1-.2 0-.4-.2-.5-.7-.2-1.1-.5-1.3-.9.4-.2.7-.4.7-.7.1-.5-.3-.9-.9-1-.3-.1-.7 0-1 .1v-.6C15.5 5.3 13.9 4 12 4z"/>
      </svg>
    ),
    x: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#000"/>
        <path fill="white" d="M13.6 10.9 17.8 6h-1l-3.6 4.2L10.2 6H6.4l4.4 6.4L6.4 18h1l3.8-4.4 3 4.4h3.8l-4.4-6.1zm-1.3 1.6-.4-.6-3.4-4.9H9.8l2.8 4 .4.6 3.6 5.1H14l-1.7-4.2z"/>
      </svg>
    ),
    twitter: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#1D9BF0"/>
        <path fill="white" d="M18.2 8.5c-.5.2-1 .3-1.5.4.5-.3.9-.8 1.1-1.4-.5.3-1 .5-1.6.6a2.6 2.6 0 0 0-4.4 2.4 7.3 7.3 0 0 1-5.3-2.7 2.6 2.6 0 0 0 .8 3.4c-.4 0-.8-.1-1.2-.3v.1A2.6 2.6 0 0 0 8.2 13c-.4.1-.8.1-1.2 0a2.6 2.6 0 0 0 2.4 1.8 5.2 5.2 0 0 1-3.9.9 7.3 7.3 0 0 0 11.3-6.1V9.3c.5-.4.9-.9 1.4-1.4l-.1.6z"/>
      </svg>
    ),
    youtube: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#FF0000"/>
        <path fill="white" d="M20 8.8a2.3 2.3 0 0 0-1.6-1.6C17 6.9 12 6.9 12 6.9s-5 0-6.4.3A2.3 2.3 0 0 0 4 8.8 24 24 0 0 0 4 12a24 24 0 0 0 .3 3.2 2.3 2.3 0 0 0 1.6 1.6c1.4.3 6.4.3 6.4.3s5 0 6.4-.3a2.3 2.3 0 0 0 1.6-1.6A24 24 0 0 0 20.3 12 24 24 0 0 0 20 8.8z"/>
        <polygon fill="#FF0000" points="10.2,14.5 14.5,12 10.2,9.5"/>
        <polygon fill="white" points="10.2,14.5 14.5,12 10.2,9.5"/>
      </svg>
    ),
    facebook: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#1877F2"/>
        <path fill="white" d="M16 12h-2.7v8h-3v-8H8V9.3h2.3V7.6c0-2.3 1.4-3.6 3.5-3.6.7 0 1.5.1 2.2.2v2.4h-1.2c-1.2 0-1.5.6-1.5 1.4v1.3H16L15.4 12z"/>
      </svg>
    ),
    linkedin: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#0A66C2"/>
        <path fill="white" d="M7 9.5h2.5V17H7V9.5zm1.25-4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM11 9.5h2.4v1h.1c.3-.6 1.1-1.2 2.3-1.2 2.5 0 3 1.6 3 3.7V17h-2.5v-3.5c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.8V17H11V9.5z"/>
      </svg>
    ),
    other: (
      <svg width={s} height={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#6B7280"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <path stroke="white" strokeWidth="1.5" fill="none" d="M12 4a8 8 0 1 0 0 16A8 8 0 0 0 12 4z"/>
        <path stroke="white" strokeWidth="1.5" fill="none" d="M12 4c-2 0-3.5 3.6-3.5 8s1.5 8 3.5 8 3.5-3.6 3.5-8-1.5-8-3.5-8z"/>
      </svg>
    ),
  };
  return <span title={platform} className="flex-shrink-0">{icons[platform] || icons["other"]}</span>;
}

const emptyForm = {
  name: "", platform: "instagram", category: "", city: "",
  followers: "", engagement_rate: "", estimated_price: "",
  email: "", phone: "", notes: "",
};

function fmtFollowers(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function Influencers() {
  const { t } = useTranslation();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Influencer | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const platforms = ["instagram", "youtube", "tiktok", "x", "twitter", "snapchat", "linkedin", "facebook", "other"];
  const categories = ["lifestyle", "fashion", "food", "tech", "beauty", "fitness", "travel", "business", "education", "entertainment", "sports", "gaming", "other"];

  useEffect(() => { fetchInfluencers(); }, []);

  async function fetchInfluencers() {
    if (!isSupabaseConfigured) {
      setInfluencers([...mockInfluencers] as Influencer[]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("influencers").select("*").order("created_at", { ascending: false });
    setInfluencers((data || []) as Influencer[]);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null); setForm({ ...emptyForm }); setError(""); setDialogOpen(true);
  }

  function openEdit(inf: Influencer) {
    setEditing(inf);
    setForm({
      name: inf.name, platform: inf.platform, category: inf.category || "",
      city: inf.city || "", followers: inf.followers?.toString() || "",
      engagement_rate: inf.engagement_rate?.toString() || "",
      estimated_price: inf.estimated_price?.toString() || "",
      email: inf.email || "", phone: inf.phone || "", notes: inf.notes || "",
    });
    setError(""); setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError(t("common.required")); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        name: form.name, platform: form.platform, category: form.category || null,
        city: form.city || null, followers: form.followers ? parseInt(form.followers) : null,
        engagement_rate: form.engagement_rate ? parseFloat(form.engagement_rate) : null,
        estimated_price: form.estimated_price ? parseFloat(form.estimated_price) : null,
        email: form.email || null, phone: form.phone || null, notes: form.notes || null,
      };
      if (!isSupabaseConfigured) {
        const now = new Date().toISOString();
        if (editing) {
          setInfluencers(c => c.map(item => item.id === editing.id ? { ...item, ...payload, updated_at: now } : item));
        } else {
          setInfluencers(c => [{ ...payload, id: `demo-${Date.now()}`, created_at: now, updated_at: now } as Influencer, ...c]);
        }
        setDialogOpen(false); return;
      }
      if (editing) {
        await supabase.from("influencers").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id);
      } else {
        await supabase.from("influencers").insert(payload);
      }
      setDialogOpen(false); fetchInfluencers();
    } catch { setError(t("errors.saveFailed")); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    if (!isSupabaseConfigured) { setInfluencers(c => c.filter(item => item.id !== deleteId)); setDeleteId(null); return; }
    await supabase.from("influencers").delete().eq("id", deleteId);
    setDeleteId(null); fetchInfluencers();
  }

  const filtered = influencers.filter(inf => {
    const matchSearch = inf.name.toLowerCase().includes(search.toLowerCase()) ||
      (inf.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (inf.category || "").toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "all" || inf.platform === platformFilter;
    return matchSearch && matchPlatform;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("influencers.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("influencers.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> {t("influencers.addInfluencer")}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("influencers.search")}
            className="h-10 ps-9 pe-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="all">{t("common.all")}</option>
            {platforms.map(p => (
              <option key={p} value={p}>{t(`influencers.platforms.${p}`)}</option>
            ))}
          </select>
          {platformFilter !== "all" && (
            <div className="flex items-center gap-1.5">
              <PlatformIcon platform={platformFilter} size={20} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("influencers.name"), t("influencers.platform"), t("influencers.category"),
                  t("influencers.city"), t("influencers.followers"), t("influencers.engagementRate"),
                  t("influencers.estimatedPrice"), t("common.actions")].map((h, i) => (
                  <th key={i} className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 bg-muted rounded animate-pulse w-20" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">{t("influencers.noInfluencers")}</td></tr>
              ) : filtered.map(inf => (
                <tr key={inf.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-medium whitespace-nowrap">{inf.name}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={inf.platform} size={22} />
                      <span className="text-xs text-muted-foreground capitalize">{t(`influencers.platforms.${inf.platform}`)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {inf.category ? t(`influencers.categories.${inf.category}`) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{inf.city || "—"}</td>
                  <td className="px-4 py-3.5 font-medium">{fmtFollowers(inf.followers)}</td>
                  <td className="px-4 py-3.5">{inf.engagement_rate ? `${inf.engagement_rate}%` : "—"}</td>
                  <td className="px-4 py-3.5">{inf.estimated_price ? `${inf.estimated_price.toLocaleString()} ${t("common.sar")}` : "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(inf)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(inf.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            {t("common.showing")} {filtered.length} {t("common.results")}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? t("influencers.editInfluencer") : t("influencers.addInfluencer")}</h2>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-950/30 dark:text-red-400">{error}</div>}
              <FormField label={`${t("influencers.name")} *`}>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label={t("influencers.platform")}>
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={form.platform} size={20} />
                    <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className={cn(inputCls, "flex-1")}>
                      {platforms.map(p => <option key={p} value={p}>{t(`influencers.platforms.${p}`)}</option>)}
                    </select>
                  </div>
                </FormField>
                <FormField label={t("influencers.category")}>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    <option value="">{t("common.select")}</option>
                    {categories.map(c => <option key={c} value={c}>{t(`influencers.categories.${c}`)}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label={t("influencers.city")}>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} />
              </FormField>
              <div className="grid grid-cols-3 gap-3">
                <FormField label={t("influencers.followers")}>
                  <input type="number" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
                <FormField label={t("influencers.engagementRate")}>
                  <input type="number" step="0.01" value={form.engagement_rate} onChange={e => setForm(f => ({ ...f, engagement_rate: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
                <FormField label={t("influencers.estimatedPrice")}>
                  <input type="number" value={form.estimated_price} onChange={e => setForm(f => ({ ...f, estimated_price: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label={t("influencers.email")}>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
                <FormField label={t("influencers.phone")}>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
              </div>
              <FormField label={t("influencers.notes")}>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={cn(inputCls, "resize-none h-auto py-2")} />
              </FormField>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex items-center justify-end gap-3">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">{t("common.cancel")}</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? "..." : t("common.save")}
              </button>
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
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">{t("common.cancel")}</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="block text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}
