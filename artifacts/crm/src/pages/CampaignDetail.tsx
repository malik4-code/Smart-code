import { useState } from "react";
import { useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle,
  Users, DollarSign, Calendar, Star,
  Play, Layers, FileText, Image, BarChart2,
  Paperclip, Megaphone, Plus, X, CheckSquare,
  ChevronDown, Target, Video, PenTool, ShoppingBag,
  CalendarDays, Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCampaigns, mockTeamMembers, type CampaignStage, type CampaignInfluencer } from "../lib/enterpriseData";

const STAGE_ORDER: CampaignStage[] = [
  "new_request","request_review","influencer_shortlisting","internal_approval",
  "client_review","client_approval","influencer_outreach","negotiation",
  "contract_confirmation","content_production","content_approval","publishing",
  "performance_tracking","final_report","campaign_closed",
];

type WorkspaceTab = "influencers" | "tasks" | "creative" | "content" | "reports" | "attachments";

const PLATFORM_ICONS: Record<string, string> = {
  instagram:"📸", youtube:"▶️", tiktok:"🎵", snapchat:"👻",
  twitter:"🐦", x:"✖️", linkedin:"💼", facebook:"📘", other:"🔗",
};

const TASK_TYPES = [
  { id: "influencer_selection", icon: Users, color: "text-purple-600 bg-purple-50" },
  { id: "creative_design",      icon: PenTool, color: "text-pink-600 bg-pink-50" },
  { id: "video_production",     icon: Video, color: "text-red-600 bg-red-50" },
  { id: "photography",          icon: Image, color: "text-blue-600 bg-blue-50" },
  { id: "content_writing",      icon: FileText, color: "text-amber-600 bg-amber-50" },
  { id: "media_buying",         icon: ShoppingBag, color: "text-emerald-600 bg-emerald-50" },
  { id: "event_management",     icon: CalendarDays, color: "text-indigo-600 bg-indigo-50" },
  { id: "reporting",            icon: BarChart2, color: "text-teal-600 bg-teal-50" },
  { id: "other",                icon: Layers, color: "text-gray-600 bg-gray-50" },
];

interface WorkspaceTask {
  id: string; title: string; type: string; assignee: string;
  status: "pending" | "in_progress" | "completed"; priority: "low" | "medium" | "high" | "urgent";
  due_date: string; notes: string;
}

function formatFollowers(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

export default function CampaignDetail() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [, params] = useRoute("/campaigns/:id");
  const campaign = mockCampaigns.find(c => c.id === params?.id);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("influencers");
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>([]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", type: "influencer_selection", assignee: "", due_date: "", priority: "medium" as const, notes: "" });

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{t("errors.notFound")}</p>
        <Link href="/campaigns" className="text-primary hover:underline text-sm">{t("common.backToList")}</Link>
      </div>
    );
  }

  const progress = Math.round(((STAGE_ORDER.indexOf(campaign.current_stage) + 1) / STAGE_ORDER.length) * 100);
  const budgetPct = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0;
  const stageIdx = STAGE_ORDER.indexOf(campaign.current_stage);

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700",
  };
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700", paused: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700",
  };
  const infStatusColors: Record<string, string> = {
    shortlisted: "bg-gray-100 text-gray-600", client_approved: "bg-blue-100 text-blue-700",
    client_rejected: "bg-red-100 text-red-700", contracted: "bg-amber-100 text-amber-700",
    content_done: "bg-purple-100 text-purple-700", published: "bg-green-100 text-green-700",
  };

  const WORKSPACE_TABS: { key: WorkspaceTab; label_en: string; label_ar: string; Icon: React.ElementType }[] = [
    { key: "influencers", label_en: "Influencer Selection", label_ar: "اختيار المؤثرين", Icon: Users },
    { key: "tasks",       label_en: "Team Tasks",           label_ar: "مهام الفريق",      Icon: CheckSquare },
    { key: "creative",    label_en: "Creative Requests",    label_ar: "الطلبات الإبداعية", Icon: PenTool },
    { key: "content",     label_en: "Content Approval",     label_ar: "موافقة المحتوى",    Icon: CheckCircle2 },
    { key: "reports",     label_en: "Reports",              label_ar: "التقارير",           Icon: BarChart2 },
    { key: "attachments", label_en: "Attachments",          label_ar: "المرفقات",           Icon: Paperclip },
  ];

  function addWorkspaceTask() {
    if (!newTask.title.trim()) return;
    const t: WorkspaceTask = {
      id: `wt-${Date.now()}`, title: newTask.title, type: newTask.type,
      assignee: newTask.assignee, status: "pending", priority: newTask.priority,
      due_date: newTask.due_date, notes: newTask.notes,
    };
    setWorkspaceTasks(prev => [...prev, t]);
    setNewTask({ title: "", type: "influencer_selection", assignee: "", due_date: "", priority: "medium", notes: "" });
    setAddTaskOpen(false);
  }

  const ic = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/campaigns" className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{campaign.name}</h1>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", statusColors[campaign.status])}>
                {t(`campaigns.statuses.${campaign.status}`)}
              </span>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityColors[campaign.priority])}>
                {t(`campaigns.priorities.${campaign.priority}`)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{campaign.client_name}</p>
          </div>
        </div>
        <button
          onClick={() => setWorkspaceOpen(w => !w)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex-shrink-0",
            workspaceOpen
              ? "bg-muted text-foreground border border-border"
              : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          {workspaceOpen ? (
            <><X className="w-4 h-4" />{isAr ? "إغلاق مساحة العمل" : "Close Workspace"}</>
          ) : (
            <><Play className="w-4 h-4" />{isAr ? "بدء العمل على الحملة" : "Start Working On Campaign"}</>
          )}
        </button>
      </div>

      {/* Campaign Workspace */}
      {workspaceOpen && (
        <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-primary/5 border-b border-primary/10 px-5 py-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-primary">{isAr ? "مساحة عمل الحملة" : "Campaign Workspace"}</span>
            <span className="text-xs text-muted-foreground ms-1">— {campaign.name}</span>
          </div>

          {/* Workspace Tabs */}
          <div className="flex border-b border-border overflow-x-auto">
            {WORKSPACE_TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn("flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}>
                <tab.Icon className="w-3.5 h-3.5" />
                {isAr ? tab.label_ar : tab.label_en}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Tab 1: Influencer Selection */}
            {activeTab === "influencers" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{isAr ? "المؤثرون في الحملة" : "Campaign Influencers"}</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />{isAr ? "إضافة مؤثر" : "Add Influencer"}
                  </button>
                </div>
                {campaign.influencers.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {isAr ? "لم يُضف مؤثرون بعد" : "No influencers added yet"}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {[isAr?"الاسم":"Name", isAr?"المنصة":"Platform", isAr?"المتابعون":"Followers",
                            isAr?"التكلفة":"Cost", isAr?"سعر العميل":"Client Price", isAr?"الحالة":"Status"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {campaign.influencers.map((inf: CampaignInfluencer) => (
                          <tr key={inf.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium">{inf.name}</td>
                            <td className="px-4 py-3 text-xs">
                              <span className="flex items-center gap-1">
                                {PLATFORM_ICONS[inf.platform] || "🔗"} {t(`influencers.platforms.${inf.platform}`)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs">{formatFollowers(inf.followers)}</td>
                            <td className="px-4 py-3 text-xs">{(inf.discount_price ?? inf.cost).toLocaleString()} {t("common.sar")}</td>
                            <td className="px-4 py-3 text-xs text-emerald-600 font-medium">{inf.client_price.toLocaleString()} {t("common.sar")}</td>
                            <td className="px-4 py-3">
                              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", infStatusColors[inf.status])}>
                                {t(`campaigns.influencerStatuses.${inf.status}`)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Team Tasks */}
            {activeTab === "tasks" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{isAr ? "مهام الفريق" : "Team Tasks"}</h3>
                  <button onClick={() => setAddTaskOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />{isAr ? "إضافة مهمة" : "Add Task"}
                  </button>
                </div>

                {/* Add task form */}
                {addTaskOpen && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">{isAr ? "عنوان المهمة *" : "Task Title *"}</label>
                        <input value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
                          className={ic} placeholder={isAr ? "اكتب عنوان المهمة..." : "Enter task title..."} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">{isAr ? "نوع المهمة" : "Task Type"}</label>
                        <select value={newTask.type} onChange={e => setNewTask(t => ({ ...t, type: e.target.value }))} className={ic}>
                          {TASK_TYPES.map(tt => (
                            <option key={tt.id} value={tt.id}>
                              {isAr ? {
                                influencer_selection:"اختيار مؤثرين", creative_design:"تصميم إبداعي",
                                video_production:"إنتاج فيديو", photography:"تصوير فوتوغرافي",
                                content_writing:"كتابة محتوى", media_buying:"شراء إعلانات",
                                event_management:"إدارة فعاليات", reporting:"تقارير", other:"أخرى",
                              }[tt.id] : tt.id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">{isAr ? "المسؤول" : "Assignee"}</label>
                        <select value={newTask.assignee} onChange={e => setNewTask(t => ({ ...t, assignee: e.target.value }))} className={ic}>
                          <option value="">{isAr ? "اختر موظفاً" : "Select member"}</option>
                          {mockTeamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">{isAr ? "تاريخ الاستحقاق" : "Due Date"}</label>
                        <input type="date" value={newTask.due_date} onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))} className={ic} dir="ltr" />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setAddTaskOpen(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                      <button onClick={addWorkspaceTask} className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
                        {isAr ? "إضافة" : "Add"}
                      </button>
                    </div>
                  </div>
                )}

                {workspaceTasks.length === 0 && !addTaskOpen ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {isAr ? "لا توجد مهام بعد — اضغط لإضافة مهمة" : "No tasks yet — click Add Task to get started"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workspaceTasks.map(task => {
                      const tt = TASK_TYPES.find(x => x.id === task.type);
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", tt?.color || "text-gray-600 bg-gray-50")}>
                            {tt && <tt.icon className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.assignee || (isAr ? "غير محدد" : "Unassigned")} {task.due_date ? `· ${task.due_date}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                              task.status === "completed" ? "bg-green-100 text-green-700" :
                              task.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            )}>{task.status.replace(/_/g, " ")}</span>
                            <button onClick={() => setWorkspaceTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "completed" } : t))}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setWorkspaceTasks(prev => prev.filter(t => t.id !== task.id))}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Creative Requests */}
            {activeTab === "creative" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{isAr ? "الطلبات الإبداعية" : "Creative Requests"}</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />{isAr ? "طلب جديد" : "New Request"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { type: "creative_design", label_en: "Creative Design", label_ar: "تصميم إبداعي", desc_en: "Banners, social media graphics, brand assets", desc_ar: "بنرات، تصاميم سوشيال ميديا، هويات بصرية" },
                    { type: "video_production", label_en: "Video Production", label_ar: "إنتاج فيديو", desc_en: "Promotional videos, reels, motion graphics", desc_ar: "فيديوهات ترويجية، ريلز، موشن جرافيك" },
                    { type: "photography", label_en: "Photography", label_ar: "تصوير", desc_en: "Product shoots, lifestyle photos", desc_ar: "تصوير منتجات، صور ليف ستايل" },
                    { type: "content_writing", label_en: "Content Writing", label_ar: "كتابة محتوى", desc_en: "Captions, scripts, campaign copy", desc_ar: "كابشن، سكريبتات، نصوص تسويقية" },
                  ].map(item => {
                    const tt = TASK_TYPES.find(x => x.id === item.type);
                    return (
                      <button key={item.type}
                        className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-start">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", tt?.color)}>
                          {tt && <tt.icon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{isAr ? item.label_ar : item.label_en}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{isAr ? item.desc_ar : item.desc_en}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Content Approval */}
            {activeTab === "content" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{isAr ? "موافقة المحتوى" : "Content Approval"}</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />{isAr ? "رفع محتوى" : "Upload Content"}
                  </button>
                </div>
                {campaign.influencers.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {isAr ? "لا يوجد محتوى بعد" : "No content uploaded yet"}
                  </div>
                ) : campaign.influencers.map(inf => (
                  <div key={inf.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{inf.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{inf.name}</p>
                      <p className="text-xs text-muted-foreground">{t(`influencers.platforms.${inf.platform}`)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200">
                        {isAr ? "موافقة" : "Approve"}
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200">
                        {isAr ? "رفض" : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Reports */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{isAr ? "تقارير الحملة" : "Campaign Reports"}</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />{isAr ? "تقرير جديد" : "New Report"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label_en: "Budget Used", label_ar: "الميزانية المستخدمة", value: `${budgetPct}%`, color: budgetPct > 90 ? "text-red-600" : "text-primary" },
                    { label_en: "Influencers", label_ar: "المؤثرون", value: campaign.influencers.length, color: "text-foreground" },
                    { label_en: "Stage Progress", label_ar: "تقدم المراحل", value: `${progress}%`, color: "text-emerald-600" },
                    { label_en: "Published", label_ar: "منشور", value: campaign.influencers.filter(i => i.status === "published").length, color: "text-blue-600" },
                  ].map(m => (
                    <div key={m.label_en} className="bg-muted/30 rounded-xl p-4 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">{isAr ? m.label_ar : m.label_en}</p>
                      <p className={cn("text-2xl font-bold", m.color)}>{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                  <p className="font-semibold mb-1">{isAr ? "التقرير النهائي" : "Final Report"}</p>
                  <p className="text-xs">{isAr ? "سيتوفر التقرير النهائي بعد اكتمال مرحلة التقرير النهائي في سير العمل" : "Final report will be available after reaching the Final Report stage in the workflow"}</p>
                </div>
              </div>
            )}

            {/* Tab 6: Attachments */}
            {activeTab === "attachments" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{isAr ? "المرفقات" : "Attachments"}</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />{isAr ? "رفع ملف" : "Upload File"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Brief", "Contract", "Content Plan", "Report"].map(type => (
                    <button key={type}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-start">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-medium">{isAr ? { Brief:"البريف", Contract:"العقد", "Content Plan":"خطة المحتوى", Report:"التقرير" }[type] : type}</span>
                    </button>
                  ))}
                </div>
                <div className="py-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                  <Paperclip className="w-7 h-7 mx-auto mb-2 opacity-30" />
                  {isAr ? "لا توجد ملفات مرفوعة بعد" : "No files uploaded yet"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campaign Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("campaigns.client"),       value: campaign.client_name,     Icon: Megaphone },
          { label: t("campaigns.accountManager"), value: campaign.account_manager, Icon: Users },
          { label: t("campaigns.startDate"),    value: campaign.start_date,      Icon: Calendar },
          { label: t("campaigns.endDate"),      value: campaign.end_date,        Icon: Flag },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <Icon className="w-4 h-4 text-muted-foreground mb-2" />
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-semibold text-foreground mt-0.5 truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          {isAr ? "الفريق" : "Campaign Team"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{campaign.account_manager.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("campaigns.accountManager")}</p>
              <p className="font-semibold text-sm">{campaign.account_manager}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600">{campaign.team_leader.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("campaigns.teamLeader")}</p>
              <p className="font-semibold text-sm">{campaign.team_leader}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          {t("campaigns.budget")} &amp; {t("campaigns.spent")}
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: t("campaigns.budget"),   value: campaign.budget,               color: "text-foreground" },
            { label: t("campaigns.spent"),    value: campaign.spent,                color: "text-amber-600" },
            { label: t("campaigns.remaining"), value: campaign.budget - campaign.spent, color: campaign.budget - campaign.spent < 0 ? "text-red-600" : "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className={cn("text-lg font-bold", color)}>
                {value.toLocaleString()} <span className="text-xs font-normal">{t("common.sar")}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${budgetPct}%` }} />
        </div>
        <div className="text-xs text-muted-foreground mt-1">{budgetPct}% {t("campaigns.budgetUsage")}</div>
      </div>

      {/* Workflow */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />{t("campaigns.workflowStages")}
          </h2>
          <span className="text-xs text-muted-foreground">{progress}% {t("campaigns.stageProgress")}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {campaign.stages.map((stage, idx) => (
            <div key={stage.stage} className="flex flex-col items-center gap-1.5">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 z-10",
                stage.status === "completed" ? "bg-primary border-primary text-primary-foreground" :
                stage.status === "active" ? "bg-primary/10 border-primary text-primary" :
                "bg-background border-muted text-muted-foreground"
              )}>
                {stage.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
                 stage.status === "active" ? <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /> :
                 <span className="text-xs">{idx + 1}</span>}
              </div>
              <p className={cn("text-[10px] leading-tight text-center",
                stage.status === "active" ? "text-primary font-medium" :
                stage.status === "completed" ? "text-muted-foreground" : "text-muted-foreground/50"
              )}>
                {t(`campaigns.stages.${stage.stage}`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Influencers table (mini) */}
      {campaign.influencers.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />{t("campaigns.influencers")} ({campaign.influencers.length})
            </h2>
            <button onClick={() => { setWorkspaceOpen(true); setActiveTab("influencers"); }}
              className="text-xs text-primary hover:underline">{isAr ? "عرض الكل في المساحة" : "View in workspace"}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[t("influencers.name"), t("influencers.platform"), t("influencers.followers"),
                    t("finance.clientPrice"), t("common.status")].map(h => (
                    <th key={h} className="px-4 py-3 text-start text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaign.influencers.map((inf: CampaignInfluencer) => (
                  <tr key={inf.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{inf.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="flex items-center gap-1">{PLATFORM_ICONS[inf.platform] || "🔗"} {t(`influencers.platforms.${inf.platform}`)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{formatFollowers(inf.followers)}</td>
                    <td className="px-4 py-3 text-xs text-emerald-600 font-medium">{inf.client_price.toLocaleString()} {t("common.sar")}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs", infStatusColors[inf.status])}>
                        {t(`campaigns.influencerStatuses.${inf.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
