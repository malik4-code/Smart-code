import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, Client } from "../lib/supabase";

const statusColors: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const emptyForm = {
  name: "", client_id: "", description: "", budget: "",
  status: "planning" as "planning" | "active" | "on_hold" | "completed" | "cancelled",
  start_date: "", end_date: "",
};

export default function Projects() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<(Project & { client?: Client })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const statuses = ["planning", "active", "on_hold", "completed", "cancelled"];

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  async function fetchProjects() {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from("projects")
      .select("*, client:clients(id, name)")
      .order("created_at", { ascending: false });
    setProjects((data || []) as (Project & { client?: Client })[]);
    setLoading(false);
  }

  async function fetchClients() {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from("clients").select("id, name").eq("status", "active").order("name");
    setClients((data || []) as Client[]);
  }

  function openAdd() {
    setEditing(null); setForm({ ...emptyForm }); setError(""); setDialogOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name, client_id: p.client_id || "", description: p.description || "",
      budget: p.budget?.toString() || "", status: p.status,
      start_date: p.start_date || "", end_date: p.end_date || "",
    });
    setError(""); setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError(t("common.required")); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        name: form.name, client_id: form.client_id || null,
        description: form.description || null, budget: form.budget ? parseFloat(form.budget) : null,
        status: form.status, start_date: form.start_date || null, end_date: form.end_date || null,
      };
      if (editing) {
        await supabase.from("projects").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id);
      } else {
        await supabase.from("projects").insert(payload);
      }
      setDialogOpen(false); fetchProjects();
    } catch { setError(t("errors.saveFailed")); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await supabase.from("projects").delete().eq("id", deleteId);
    setDeleteId(null); fetchProjects();
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      ((p as any).client?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("projects.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("projects.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> {t("projects.addProject")}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("projects.search")}
            className="h-10 ps-9 pe-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="all">{t("common.all")}</option>
          {statuses.map(s => <option key={s} value={s}>{t(`projects.statuses.${s}`)}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("projects.projectName"), t("projects.client"), t("projects.budget"), t("projects.status"), t("projects.startDate"), t("projects.endDate"), t("common.actions")].map((h, i) => (
                  <th key={i} className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 bg-muted rounded animate-pulse w-20" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">{t("projects.noProjects")}</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 font-medium">{p.name}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{(p as any).client?.name || "—"}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {p.budget ? `${p.budget.toLocaleString()} ${t("common.sar")}` : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusColors[p.status])}>
                      {t(`projects.statuses.${p.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{p.start_date || "—"}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{p.end_date || "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h2 className="font-semibold">{editing ? t("projects.editProject") : t("projects.addProject")}</h2>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-950/30 dark:text-red-400">{error}</div>}
              <FF label={`${t("projects.projectName")} *`}>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={ic} />
              </FF>
              <div className="grid grid-cols-2 gap-4">
                <FF label={t("projects.client")}>
                  <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} className={ic}>
                    <option value="">{t("projects.selectClient")}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FF>
                <FF label={t("projects.status")}>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof form.status }))} className={ic}>
                    {statuses.map(s => <option key={s} value={s}>{t(`projects.statuses.${s}`)}</option>)}
                  </select>
                </FF>
              </div>
              <FF label={t("projects.budget")}>
                <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className={ic} dir="ltr" />
              </FF>
              <div className="grid grid-cols-2 gap-4">
                <FF label={t("projects.startDate")}>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={ic} />
                </FF>
                <FF label={t("projects.endDate")}>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={ic} />
                </FF>
              </div>
              <FF label={t("projects.description")}>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={cn(ic, "h-auto resize-none py-2")} />
              </FF>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex justify-end gap-3">
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
            <p className="text-sm text-muted-foreground mb-5">{t("projects.confirmDelete")}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">{t("common.cancel")}</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ic = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="block text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}
