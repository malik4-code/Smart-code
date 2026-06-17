import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Influencer } from "../lib/supabase";
import { mockInfluencers } from "../lib/mockData";

const platformColors: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-700",
  youtube: "bg-red-100 text-red-700",
  tiktok: "bg-slate-100 text-slate-700",
  twitter: "bg-sky-100 text-sky-700",
  snapchat: "bg-yellow-100 text-yellow-700",
  linkedin: "bg-blue-100 text-blue-700",
  facebook: "bg-indigo-100 text-indigo-700",
  other: "bg-gray-100 text-gray-700",
};

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

  const platforms = ["instagram", "youtube", "tiktok", "twitter", "snapchat", "linkedin", "facebook", "other"];
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("influencers.search")}
            className="h-10 ps-9 pe-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
          />
        </div>
        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="all">{t("common.all")}</option>
          {platforms.map(p => <option key={p} value={p}>{t(`influencers.platforms.${p}`)}</option>)}
        </select>
      </div>

      {/* Table */}
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
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", platformColors[inf.platform] || "bg-gray-100 text-gray-600")}>
                      {t(`influencers.platforms.${inf.platform}`)}
                    </span>
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

      {/* Add/Edit Dialog */}
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
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className={inputCls}>
                    {platforms.map(p => <option key={p} value={p}>{t(`influencers.platforms.${p}`)}</option>)}
                  </select>
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

      {/* Delete Confirm */}
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
