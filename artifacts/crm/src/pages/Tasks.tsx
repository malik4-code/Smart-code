import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Plus, Search, Pencil, Trash2, X, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Project } from "../lib/supabase";
import { mockTasks, mockProjects } from "../lib/mockData";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const emptyForm = {
  title: "", description: "", project_id: "",
  status: "pending" as "pending" | "in_progress" | "completed" | "cancelled",
  priority: "medium" as "low" | "medium" | "high" | "urgent",
  due_date: "",
};

export default function Tasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<(Task & { project?: Project })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const statuses = ["pending", "in_progress", "completed", "cancelled"];
  const priorities = ["low", "medium", "high", "urgent"];
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchTasks(); fetchProjects(); }, []);

  async function fetchTasks() {
    if (!isSupabaseConfigured) {
      setTasks([...mockTasks].sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")) as (Task & { project?: Project })[]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("tasks")
      .select("*, project:projects(id, name)")
      .order("due_date", { ascending: true, nullsFirst: false });
    setTasks((data || []) as (Task & { project?: Project })[]);
    setLoading(false);
  }

  async function fetchProjects() {
    if (!isSupabaseConfigured) {
      setProjects(mockProjects as Project[]);
      return;
    }
    const { data } = await supabase.from("projects").select("id, name").order("name");
    setProjects((data || []) as Project[]);
  }

  function openAdd() {
    setEditing(null); setForm({ ...emptyForm }); setError(""); setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setForm({
      title: task.title, description: task.description || "",
      project_id: task.project_id || "", status: task.status, priority: task.priority,
      due_date: task.due_date || "",
    });
    setError(""); setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError(t("common.required")); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        title: form.title, description: form.description || null,
        project_id: form.project_id || null,
        status: form.status, priority: form.priority,
        due_date: form.due_date || null,
      };
      if (!isSupabaseConfigured) {
        const now = new Date().toISOString();
        const project = projects.find(p => p.id === payload.project_id);
        if (editing) {
          setTasks(c => c.map(item => item.id === editing.id ? { ...item, ...payload, project, updated_at: now } : item));
        } else {
          setTasks(c => [{ ...payload, id: `demo-${Date.now()}`, assignee_id: null, project, created_at: now, updated_at: now } as Task & { project?: Project }, ...c]);
        }
        setDialogOpen(false); return;
      }
      if (editing) {
        await supabase.from("tasks").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id);
      } else {
        await supabase.from("tasks").insert(payload);
      }
      setDialogOpen(false); fetchTasks();
    } catch { setError(t("errors.saveFailed")); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    if (!isSupabaseConfigured) { setTasks(c => c.filter(item => item.id !== deleteId)); setDeleteId(null); return; }
    await supabase.from("tasks").delete().eq("id", deleteId);
    setDeleteId(null); fetchTasks();
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      ((t as any).project?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  function isOverdue(task: Task) {
    return task.due_date && task.due_date < today && task.status !== "completed" && task.status !== "cancelled";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("tasks.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("tasks.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> {t("tasks.addTask")}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("tasks.search")}
            className="h-10 ps-9 pe-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-56"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="all">{t("common.all")}</option>
          {statuses.map(s => <option key={s} value={s}>{t(`tasks.statuses.${s}`)}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option value="all">{t("common.all")}</option>
          {priorities.map(p => <option key={p} value={p}>{t(`tasks.priorities.${p}`)}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("tasks.taskTitle"), t("tasks.project"), t("tasks.status"), t("tasks.priority"), t("tasks.dueDate"), t("common.actions")].map((h, i) => (
                  <th key={i} className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 bg-muted rounded animate-pulse w-20" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">{t("tasks.noTasks")}</td></tr>
              ) : filtered.map(task => (
                <tr key={task.id} className={cn("hover:bg-muted/30 transition-colors", isOverdue(task) && "bg-red-50/50 dark:bg-red-950/10")}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {isOverdue(task) && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                      <span className="font-medium">{task.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{(task as any).project?.name || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusColors[task.status])}>
                      {t(`tasks.statuses.${task.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", priorityColors[task.priority])}>
                      {t(`tasks.priorities.${task.priority}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {task.due_date ? (
                      <div className={cn("flex items-center gap-1.5", isOverdue(task) ? "text-red-600" : "text-muted-foreground")}>
                        <Clock className="w-3.5 h-3.5" />
                        {task.due_date}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h2 className="font-semibold">{editing ? t("tasks.editTask") : t("tasks.addTask")}</h2>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
              <FF label={`${t("tasks.taskTitle")} *`}>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={ic} />
              </FF>
              <FF label={t("tasks.project")}>
                <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className={ic}>
                  <option value="">{t("tasks.selectProject")}</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </FF>
              <div className="grid grid-cols-2 gap-4">
                <FF label={t("tasks.status")}>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof form.status }))} className={ic}>
                    {statuses.map(s => <option key={s} value={s}>{t(`tasks.statuses.${s}`)}</option>)}
                  </select>
                </FF>
                <FF label={t("tasks.priority")}>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as typeof form.priority }))} className={ic}>
                    {priorities.map(p => <option key={p} value={p}>{t(`tasks.priorities.${p}`)}</option>)}
                  </select>
                </FF>
              </div>
              <FF label={t("tasks.dueDate")}>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className={ic} />
              </FF>
              <FF label={t("tasks.description")}>
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
            <p className="text-sm text-muted-foreground mb-5">{t("tasks.confirmDelete")}</p>
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
