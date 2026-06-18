import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Plus, Search, Pencil, Trash2, X, AlertCircle, Clock, User, Users, Paperclip, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Project } from "../lib/supabase";
import { mockTasks, mockProjects } from "../lib/mockData";
import { mockCampaigns, mockTeamMembers, mockEnterpriseClients } from "../lib/enterpriseData";

const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed:   "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled:   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  high:   "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};
const DEPARTMENTS = ["marketing", "creative", "finance", "operations", "management", "influencer_relations"];

interface EnhancedTask extends Task {
  project?: Project;
  campaign_id?: string;
  campaign_name?: string;
  client_name?: string;
  assigned_by?: string;
  campaign_leader?: string;
  department?: string;
  time_logs?: {
    created_at: string;
    assigned_at?: string;
    accepted_at?: string;
    started_at?: string;
    completed_at?: string;
    delayed_at?: string;
    last_updated_at: string;
  };
}

const TASK_TYPES = [
  "influencer_selection", "creative_design", "video_production", "photography",
  "content_writing", "media_buying", "event_management", "reporting", "other",
];

const emptyForm = {
  title: "", description: "",
  project_id: "", campaign_id: "", client_name: "",
  assignee_id: "", assigned_by: "", campaign_leader: "", department: "",
  task_type: "",
  status: "pending" as "pending" | "in_progress" | "completed" | "cancelled",
  priority: "medium" as "low" | "medium" | "high" | "urgent",
  due_date: "", notes: "",
};

export default function Tasks() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EnhancedTask | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const statuses = ["pending", "in_progress", "completed", "cancelled"];
  const priorities = ["low", "medium", "high", "urgent"];
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchTasks(); fetchProjects(); }, []);

  async function fetchTasks() {
    if (!isSupabaseConfigured) {
      const enhanced: EnhancedTask[] = [...mockTasks].map(task => ({
        ...task,
        time_logs: {
          created_at: task.created_at,
          last_updated_at: task.updated_at,
          ...(task.status !== "pending" ? { assigned_at: task.created_at } : {}),
          ...(["in_progress", "completed"].includes(task.status) ? { started_at: task.updated_at } : {}),
          ...(task.status === "completed" ? { completed_at: task.updated_at } : {}),
        }
      })) as EnhancedTask[];
      setTasks(enhanced.sort((a, b) => (a.due_date || "").localeCompare(b.due_date || "")));
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("tasks")
      .select("*, project:projects(id, name)")
      .order("due_date", { ascending: true, nullsFirst: false });
    setTasks((data || []) as EnhancedTask[]);
    setLoading(false);
  }

  async function fetchProjects() {
    if (!isSupabaseConfigured) { setProjects(mockProjects as Project[]); return; }
    const { data } = await supabase.from("projects").select("id, name").order("name");
    setProjects((data || []) as Project[]);
  }

  function openAdd() {
    setEditing(null); setForm({ ...emptyForm }); setError(""); setDialogOpen(true);
  }

  function openEdit(task: EnhancedTask) {
    setEditing(task);
    setForm({
      title: task.title, description: task.description || "",
      project_id: task.project_id || "",
      campaign_id: task.campaign_id || "",
      client_name: task.client_name || "",
      assignee_id: task.assignee_id || "",
      assigned_by: task.assigned_by || "",
      campaign_leader: task.campaign_leader || "",
      department: task.department || "",
      task_type: (task as any).task_type || "",
      status: task.status, priority: task.priority,
      due_date: task.due_date || "", notes: "",
    });
    setError(""); setDialogOpen(true);
  }

  function handleCampaignChange(campaignId: string) {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    const leader = campaign ? mockTeamMembers.find(m => m.name === campaign.team_leader) : null;
    setForm(f => ({
      ...f,
      campaign_id: campaignId,
      client_name: campaign?.client_name || "",
      campaign_leader: leader?.id || campaign?.team_leader || f.campaign_leader,
    }));
  }

  async function handleSave() {
    if (!form.title.trim()) { setError(t("common.required")); return; }
    setSaving(true); setError("");
    try {
      const now = new Date().toISOString();
      const campaign = mockCampaigns.find(c => c.id === form.campaign_id);
      const assignee = mockTeamMembers.find(m => m.id === form.assignee_id);
      const assigner = mockTeamMembers.find(m => m.id === form.assigned_by);
      const leader = mockTeamMembers.find(m => m.id === form.campaign_leader);

      const timeLogs = {
        created_at: editing?.time_logs?.created_at || now,
        last_updated_at: now,
        assigned_at: form.assignee_id ? (editing?.time_logs?.assigned_at || now) : undefined,
        accepted_at: editing?.time_logs?.accepted_at,
        started_at: form.status === "in_progress" ? (editing?.time_logs?.started_at || now) : editing?.time_logs?.started_at,
        completed_at: form.status === "completed" ? (editing?.time_logs?.completed_at || now) : editing?.time_logs?.completed_at,
        delayed_at: (() => {
          if (form.due_date && form.due_date < today && form.status !== "completed") return now;
          return editing?.time_logs?.delayed_at;
        })(),
      };

      const base = {
        title: form.title, description: form.description || null,
        project_id: form.project_id || null,
        status: form.status, priority: form.priority,
        due_date: form.due_date || null,
      };

      if (!isSupabaseConfigured) {
        const project = projects.find(p => p.id === base.project_id);
        const newTask: EnhancedTask = {
          ...base,
          id: editing?.id || `demo-${Date.now()}`,
          assignee_id: form.assignee_id || null,
          created_at: editing?.created_at || now,
          updated_at: now,
          project,
          campaign_id: form.campaign_id,
          campaign_name: campaign?.name,
          client_name: campaign?.client_name || form.client_name,
          assigned_by: assigner?.name,
          campaign_leader: leader?.name || form.campaign_leader,
          department: form.department,
          task_type: form.task_type,
          time_logs: timeLogs,
        } as EnhancedTask & { task_type: string };
        if (editing) {
          setTasks(c => c.map(item => item.id === editing.id ? newTask : item));
        } else {
          setTasks(c => [newTask, ...c]);
        }
        setDialogOpen(false); return;
      }
      if (editing) {
        await supabase.from("tasks").update({ ...base, updated_at: now }).eq("id", editing.id);
      } else {
        await supabase.from("tasks").insert(base);
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

  const filtered = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      ((task as any).project?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (task.campaign_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (task.client_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || task.status === statusFilter;
    const matchPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchCampaign = campaignFilter === "all" || task.campaign_id === campaignFilter;
    return matchSearch && matchStatus && matchPriority && matchCampaign;
  });

  function isOverdue(task: Task) {
    return task.due_date && task.due_date < today && task.status !== "completed" && task.status !== "cancelled";
  }

  function fmtTime(ts?: string) {
    if (!ts) return null;
    return new Date(ts).toLocaleString(isAr ? "ar-SA" : "en-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    overdue: tasks.filter(t => isOverdue(t)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("tasks.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("tasks.subtitle")}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />{t("tasks.addTask")}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isAr ? "إجمالي المهام" : "Total Tasks", val: stats.total, cls: "text-foreground", bg: "bg-muted/40" },
          { label: t("tasks.statuses.pending"), val: stats.pending, cls: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
          { label: t("tasks.statuses.in_progress"), val: stats.inProgress, cls: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: t("tasks.overdue"), val: stats.overdue, cls: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
        ].map(({ label, val, cls, bg }) => (
          <div key={label} className={cn("rounded-xl p-4 border border-border shadow-sm", bg)}>
            <div className={cn("text-2xl font-bold", cls)}>{val}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
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
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="all">{t("common.all")}</option>
          {statuses.map(s => <option key={s} value={s}>{t(`tasks.statuses.${s}`)}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="all">{t("common.all")}</option>
          {priorities.map(p => <option key={p} value={p}>{t(`tasks.priorities.${p}`)}</option>)}
        </select>
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="all">{isAr ? "جميع الحملات" : "All Campaigns"}</option>
          {mockCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  t("tasks.taskTitle"), isAr ? "الحملة / المشروع" : "Campaign / Project",
                  isAr ? "العميل" : "Client", isAr ? "المسؤول" : "Assignee",
                  t("tasks.status"), t("tasks.priority"), t("tasks.dueDate"), t("common.actions")
                ].map((h, i) => (
                  <th key={i} className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 bg-muted rounded animate-pulse w-16" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">{t("tasks.noTasks")}</td></tr>
              ) : filtered.map(task => {
                const overdue = isOverdue(task);
                const et = task as EnhancedTask;
                return (
                  <tr key={task.id} className={cn("hover:bg-muted/30 transition-colors", overdue && "bg-red-50/50 dark:bg-red-950/10")}>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <div className="flex items-start gap-2">
                        {overdue && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />}
                        <div className="min-w-0">
                          <p className="font-medium leading-snug">{task.title}</p>
                          {et.department && <p className="text-xs text-muted-foreground mt-0.5">{t(`tasks.departments.${et.department}`) || et.department}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs">
                        {et.campaign_name && <p className="font-medium text-primary">{et.campaign_name}</p>}
                        {(et as any).project?.name && <p className="text-muted-foreground">{(et as any).project.name}</p>}
                        {!et.campaign_name && !(et as any).project && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{et.client_name || "—"}</td>
                    <td className="px-4 py-3.5">
                      {et.campaign_leader ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-primary">{et.campaign_leader.charAt(0)}</span>
                          </div>
                          <span className="text-muted-foreground truncate max-w-[80px]">{et.campaign_leader}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", STATUS_COLORS[task.status])}>
                        {t(`tasks.statuses.${task.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", PRIORITY_COLORS[task.priority])}>
                        {t(`tasks.priorities.${task.priority}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={cn("flex items-center gap-1.5 text-xs whitespace-nowrap", overdue ? "text-red-600" : "text-muted-foreground")}>
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {task.due_date || "—"}
                        {overdue && <span className="text-[10px] font-medium">{isAr ? "• متأخرة" : "• LATE"}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">{t("common.showing")} {filtered.length} {t("common.results")}</div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold">{editing ? t("tasks.editTask") : t("tasks.addTask")}</h2>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-950/30 dark:text-red-400">{error}</div>}

              <FF label={`${t("tasks.taskTitle")} *`}>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={ic} />
              </FF>

              <div className="grid grid-cols-2 gap-4">
                <FF label={isAr ? "الحملة المرتبطة" : "Related Campaign"}>
                  <select value={form.campaign_id} onChange={e => handleCampaignChange(e.target.value)} className={ic}>
                    <option value="">{isAr ? "اختر الحملة" : "Select Campaign"}</option>
                    {mockCampaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </FF>
                <FF label={isAr ? "العميل" : "Client"}>
                  <input value={form.client_name} readOnly
                    className={cn(ic, "bg-muted/30 text-muted-foreground cursor-default")}
                    placeholder={isAr ? "يُملأ تلقائياً من الحملة" : "Auto-filled from campaign"} />
                </FF>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FF label={t("tasks.project")}>
                  <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className={ic}>
                    <option value="">{t("tasks.selectProject")}</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </FF>
                <FF label={isAr ? "القسم" : "Department"}>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={ic}>
                    <option value="">{t("common.select")}</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{t(`tasks.departments.${d}`) || d}</option>)}
                  </select>
                </FF>
              </div>

              <FF label={isAr ? "نوع المهمة" : "Task Type"}>
                <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))} className={ic}>
                  <option value="">{isAr ? "اختر نوع المهمة" : "Select task type"}</option>
                  {TASK_TYPES.map(tt => (
                    <option key={tt} value={tt}>{t(`tasks.taskTypes.${tt}`) || tt.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </FF>

              <div className="grid grid-cols-2 gap-4">
                <FF label={isAr ? "تعيين إلى" : "Assigned To"}>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))} className={cn(ic, "ps-9")}>
                      <option value="">{isAr ? "اختر المسؤول" : "Select Assignee"}</option>
                      {mockTeamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </FF>
                <FF label={isAr ? "تعيين بواسطة" : "Assigned By"}>
                  <select value={form.assigned_by} onChange={e => setForm(f => ({ ...f, assigned_by: e.target.value }))} className={ic}>
                    <option value="">{isAr ? "اختر" : "Select"}</option>
                    {mockTeamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </FF>
              </div>

              <FF label={isAr ? "قائد الحملة" : "Campaign Leader"}>
                <div className="relative">
                  <Users className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select value={form.campaign_leader} onChange={e => setForm(f => ({ ...f, campaign_leader: e.target.value }))} className={cn(ic, "ps-9")}>
                    <option value="">{isAr ? "اختر القائد" : "Select Leader"}</option>
                    {mockTeamMembers.filter(m => ["team_leader", "dept_manager", "admin", "manager"].includes(m.role)).map(m => (
                      <option key={m.id} value={m.id}>{m.name} — {t(`roles.${m.role}`)}</option>
                    ))}
                  </select>
                </div>
              </FF>

              <div className="grid grid-cols-3 gap-4">
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
                <FF label={t("tasks.dueDate")}>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className={ic} />
                </FF>
              </div>

              <FF label={t("tasks.description")}>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className={cn(ic, "h-auto resize-none py-2")} />
              </FF>

              {editing?.time_logs && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />{isAr ? "سجل الأوقات التلقائي" : "Automatic Time Log"}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { key: "created_at", label_en: "Created", label_ar: "تاريخ الإنشاء", val: editing.time_logs.created_at },
                      { key: "assigned_at", label_en: "Assigned", label_ar: "تاريخ التعيين", val: editing.time_logs.assigned_at },
                      { key: "accepted_at", label_en: "Accepted", label_ar: "تاريخ القبول", val: editing.time_logs.accepted_at },
                      { key: "started_at", label_en: "Started", label_ar: "تاريخ البدء", val: editing.time_logs.started_at },
                      { key: "completed_at", label_en: "Completed", label_ar: "تاريخ الإنجاز", val: editing.time_logs.completed_at },
                      { key: "delayed_at", label_en: "Delayed", label_ar: "تاريخ التأخير", val: editing.time_logs.delayed_at },
                      { key: "last_updated_at", label_en: "Last Update", label_ar: "آخر تحديث", val: editing.time_logs.last_updated_at },
                    ].map(({ label_en, label_ar, val }) => val ? (
                      <div key={label_en} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{isAr ? label_ar : label_en}</span>
                        <span className="font-medium font-mono">{fmtTime(val)}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
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
