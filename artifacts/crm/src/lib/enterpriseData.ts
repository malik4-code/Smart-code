const today = new Date();
const addDays = (d: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split("T")[0];
};
const subHours = (h: number) => {
  const dt = new Date(today);
  dt.setHours(dt.getHours() - h);
  return dt.toISOString();
};

export type CampaignStage =
  | "new_request" | "request_review" | "influencer_shortlisting"
  | "internal_approval" | "client_review" | "client_approval"
  | "influencer_outreach" | "negotiation" | "contract_confirmation"
  | "content_production" | "content_approval" | "publishing"
  | "performance_tracking" | "final_report" | "campaign_closed";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "needs_revision";
export type DocumentFolder = "contracts" | "proposals" | "reports" | "invoices" | "briefs";
export type NotificationType = "approval" | "task" | "deadline" | "client" | "system";
export type ActivityType = "stage_change" | "approval" | "comment" | "upload" | "price_change" | "status_change" | "login" | "create" | "update" | "delete";

export interface CampaignStageInfo {
  stage: CampaignStage;
  status: "completed" | "active" | "pending";
  owner: string;
  due_date: string | null;
  completed_date: string | null;
  notes: string | null;
  sla_hours: number | null;
  sla_breached: boolean;
}

export interface CampaignInfluencer {
  id: string;
  name: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  cost: number;
  client_price: number;
  discount_price: number | null;
  status: "shortlisted" | "client_approved" | "client_rejected" | "contracted" | "content_done" | "published";
  notes: string | null;
}

export interface MockCampaign {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
  account_manager: string;
  team_leader: string;
  budget: number;
  spent: number;
  current_stage: CampaignStage;
  stages: CampaignStageInfo[];
  influencers: CampaignInfluencer[];
  start_date: string;
  end_date: string;
  status: "active" | "paused" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  created_at: string;
  updated_at: string;
}

export interface MockApproval {
  id: string;
  type: "campaign" | "influencer_list" | "budget" | "content" | "contract";
  title: string;
  description: string;
  campaign_id: string | null;
  campaign_name: string | null;
  requested_by: string;
  requested_at: string;
  current_level: number;
  levels: {
    level: number;
    title: string;
    approver: string;
    status: ApprovalStatus;
    date: string | null;
    comment: string | null;
  }[];
  status: ApprovalStatus;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface MockDocument {
  id: string;
  name: string;
  folder: DocumentFolder;
  campaign_id: string | null;
  campaign_name: string | null;
  client_name: string | null;
  file_type: "pdf" | "docx" | "xlsx" | "pptx" | "image" | "other";
  file_size: string;
  version: number;
  uploaded_by: string;
  uploaded_at: string;
  tags: string[];
}

export interface MockNotification {
  id: string;
  type: NotificationType;
  title_ar: string;
  body_ar: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

export interface MockActivity {
  id: string;
  type: ActivityType;
  user: string;
  user_role: string;
  action_ar: string;
  entity_ar: string;
  details_ar: string | null;
  created_at: string;
}

export interface MockFinanceRecord {
  id: string;
  campaign_id: string;
  campaign_name: string;
  client_name: string;
  influencer_name: string;
  influencer_id: string;
  base_cost: number;
  discount: number;
  final_cost: number;
  client_price: number;
  profit_margin: number;
  status: "pending" | "invoiced" | "paid" | "overdue";
  invoice_date: string | null;
  payment_date: string | null;
}

export interface MockTeamMember {
  id: string;
  name: string;
  role: "admin" | "dept_manager" | "team_leader" | "influencer_specialist" | "account_manager" | "finance_user" | "client_user";
  email: string;
  tasks_completed: number;
  tasks_pending: number;
  campaigns_active: number;
  productivity_score: number;
  avatar_initials: string;
}

const buildStages = (currentIdx: number): CampaignStageInfo[] => {
  const allStages: { stage: CampaignStage; sla: number | null; owner: string }[] = [
    { stage: "new_request", sla: null, owner: "سارة القحطاني" },
    { stage: "request_review", sla: 2, owner: "محمد العمري" },
    { stage: "influencer_shortlisting", sla: 24, owner: "نورة الزهراني" },
    { stage: "internal_approval", sla: 12, owner: "أحمد الغامدي" },
    { stage: "client_review", sla: 24, owner: "العميل" },
    { stage: "client_approval", sla: 24, owner: "العميل" },
    { stage: "influencer_outreach", sla: 24, owner: "نورة الزهراني" },
    { stage: "negotiation", sla: 48, owner: "نورة الزهراني" },
    { stage: "contract_confirmation", sla: null, owner: "خالد السلمان" },
    { stage: "content_production", sla: null, owner: "المؤثر" },
    { stage: "content_approval", sla: 12, owner: "محمد العمري" },
    { stage: "publishing", sla: null, owner: "المؤثر" },
    { stage: "performance_tracking", sla: null, owner: "نورة الزهراني" },
    { stage: "final_report", sla: 72, owner: "سارة القحطاني" },
    { stage: "campaign_closed", sla: null, owner: "محمد العمري" },
  ];
  return allStages.map((s, i) => ({
    stage: s.stage,
    status: (i < currentIdx ? "completed" : i === currentIdx ? "active" : "pending") as "completed" | "active" | "pending",
    owner: s.owner,
    due_date: i <= currentIdx ? addDays(i - currentIdx + 2) : null,
    completed_date: i < currentIdx ? addDays(i - currentIdx - 1) : null,
    notes: i < currentIdx ? "تم الإنجاز بنجاح" : null,
    sla_hours: s.sla,
    sla_breached: i < currentIdx && s.sla !== null && i % 4 === 0,
  }));
};

export const mockCampaigns: MockCampaign[] = [
  {
    id: "cam1", name: "حملة رمضان 2025 — STC",
    client_id: "c2", client_name: "مجموعة STC للاتصالات",
    account_manager: "سارة القحطاني", team_leader: "محمد العمري",
    budget: 350000, spent: 310000, current_stage: "performance_tracking",
    stages: buildStages(12),
    influencers: [
      { id: "i1", name: "لجين عمران", platform: "instagram", followers: 4200000, engagement_rate: 3.8, cost: 22000, client_price: 25000, discount_price: 20000, status: "published", notes: null },
      { id: "i4", name: "عبدالله السدحان", platform: "snapchat", followers: 5600000, engagement_rate: 7.1, cost: 30000, client_price: 35000, discount_price: null, status: "published", notes: null },
      { id: "i7", name: "أميرة العيدروس", platform: "instagram", followers: 3100000, engagement_rate: 4.3, cost: 18000, client_price: 22000, discount_price: null, status: "published", notes: null },
    ],
    start_date: "2025-02-20", end_date: "2025-04-05", status: "active", priority: "high",
    description: "حملة تسويقية شاملة خلال شهر رمضان المبارك تستهدف المستخدمين السعوديين",
    created_at: "2025-02-01T08:00:00Z", updated_at: subHours(3),
  },
  {
    id: "cam2", name: "إطلاق خط العناية الجديد — لوريال",
    client_id: "c3", client_name: "علامة لوريال المملكة",
    account_manager: "خالد السلمان", team_leader: "أحمد الغامدي",
    budget: 180000, spent: 95000, current_stage: "content_production",
    stages: buildStages(9),
    influencers: [
      { id: "i7", name: "أميرة العيدروس", platform: "instagram", followers: 3100000, engagement_rate: 4.3, cost: 18000, client_price: 22000, discount_price: null, status: "contracted", notes: "في مرحلة التصوير" },
      { id: "i3", name: "رهف محمد", platform: "tiktok", followers: 2100000, engagement_rate: 9.4, cost: 15000, client_price: 18000, discount_price: 14000, status: "contracted", notes: null },
    ],
    start_date: "2025-05-01", end_date: addDays(30), status: "active", priority: "urgent",
    description: "إطلاق خط عناية جديد للبشرة بالتعاون مع مؤثري الجمال",
    created_at: "2025-04-15T09:00:00Z", updated_at: subHours(1),
  },
  {
    id: "cam3", name: "موسم جدة 2025 — نايفوري",
    client_id: "c6", client_name: "نايفوري للجواهر",
    account_manager: "ريم الدوسري", team_leader: "محمد العمري",
    budget: 220000, spent: 80000, current_stage: "negotiation",
    stages: buildStages(7),
    influencers: [
      { id: "i1", name: "لجين عمران", platform: "instagram", followers: 4200000, engagement_rate: 3.8, cost: 22000, client_price: 25000, discount_price: null, status: "shortlisted", notes: null },
      { id: "i3", name: "رهف محمد", platform: "tiktok", followers: 2100000, engagement_rate: 9.4, cost: 15000, client_price: 18000, discount_price: null, status: "client_approved", notes: null },
      { id: "i5", name: "منى الشمري", platform: "instagram", followers: 890000, engagement_rate: 5.5, cost: 7000, client_price: 8000, discount_price: null, status: "client_rejected", notes: "العميل طلب مؤثرة أخرى" },
    ],
    start_date: "2025-05-15", end_date: addDays(45), status: "active", priority: "high",
    description: "حملة موسم جدة مع مؤثرات الأزياء والمجوهرات",
    created_at: "2025-05-01T10:00:00Z", updated_at: subHours(5),
  },
  {
    id: "cam4", name: "العودة للدراسة — نون أكاديمية",
    client_id: "c4", client_name: "أكاديمية نون التعليمية",
    account_manager: "فيصل العتيبي", team_leader: "أحمد الغامدي",
    budget: 95000, spent: 15000, current_stage: "influencer_shortlisting",
    stages: buildStages(2),
    influencers: [
      { id: "i6", name: "طارق العمر", platform: "youtube", followers: 1350000, engagement_rate: 4.9, cost: 10000, client_price: 12000, discount_price: null, status: "shortlisted", notes: null },
    ],
    start_date: addDays(20), end_date: addDays(60), status: "active", priority: "medium",
    description: "حملة موسم العودة المدرسية 2025 مع مؤثرين التعليم",
    created_at: "2025-05-20T08:30:00Z", updated_at: subHours(8),
  },
  {
    id: "cam5", name: "يوم التأسيس السعودي — سدايا",
    client_id: "c1", client_name: "شركة سدايا للتقنية",
    account_manager: "نورة الزهراني", team_leader: "محمد العمري",
    budget: 420000, spent: 0, current_stage: "new_request",
    stages: buildStages(0), influencers: [],
    start_date: addDays(40), end_date: addDays(80), status: "active", priority: "urgent",
    description: "حملة احتفالية كبرى بيوم التأسيس السعودي مع أكبر المؤثرين",
    created_at: "2025-05-22T11:00:00Z", updated_at: subHours(12),
  },
  {
    id: "cam6", name: "صيف 2025 — مطاعم كودو",
    client_id: "c5", client_name: "مطاعم كودو",
    account_manager: "سارة القحطاني", team_leader: "أحمد الغامدي",
    budget: 120000, spent: 120000, current_stage: "campaign_closed",
    stages: buildStages(14),
    influencers: [
      { id: "i5", name: "منى الشمري", platform: "instagram", followers: 890000, engagement_rate: 5.5, cost: 7000, client_price: 8000, discount_price: null, status: "published", notes: null },
      { id: "i10", name: "أنس مروان", platform: "snapchat", followers: 2400000, engagement_rate: 6.8, cost: 18000, client_price: 20000, discount_price: null, status: "published", notes: null },
    ],
    start_date: "2025-03-01", end_date: "2025-04-30", status: "completed", priority: "medium",
    description: "حملة موسم الصيف لمطاعم كودو",
    created_at: "2025-02-15T08:00:00Z", updated_at: "2025-04-30T18:00:00Z",
  },
];

export const mockApprovals: MockApproval[] = [
  {
    id: "app1", type: "influencer_list", title: "قائمة مؤثرين حملة لوريال",
    description: "قائمة بـ 5 مؤثرات جمال للموافقة قبل التواصل معهن",
    campaign_id: "cam2", campaign_name: "إطلاق خط العناية — لوريال",
    requested_by: "نورة الزهراني", requested_at: subHours(6), current_level: 2,
    levels: [
      { level: 1, title: "قائد الفريق", approver: "محمد العمري", status: "approved", date: subHours(4), comment: "قائمة ممتازة" },
      { level: 2, title: "مدير القسم", approver: "أحمد الغامدي", status: "pending", date: null, comment: null },
      { level: 3, title: "العميل", approver: "نورة لوريال", status: "pending", date: null, comment: null },
    ],
    status: "pending", priority: "urgent",
  },
  {
    id: "app2", type: "budget", title: "زيادة ميزانية حملة سدايا",
    description: "طلب زيادة الميزانية من 420,000 إلى 550,000 ر.س لإضافة مؤثرين كبار",
    campaign_id: "cam5", campaign_name: "يوم التأسيس السعودي — سدايا",
    requested_by: "سارة القحطاني", requested_at: subHours(12), current_level: 1,
    levels: [
      { level: 1, title: "قائد الفريق", approver: "محمد العمري", status: "pending", date: null, comment: null },
      { level: 2, title: "مدير القسم", approver: "أحمد الغامدي", status: "pending", date: null, comment: null },
    ],
    status: "pending", priority: "high",
  },
  {
    id: "app3", type: "content", title: "مراجعة محتوى لجين عمران — STC",
    description: "مراجعة 3 منشورات و2 ستوري قبل النشر في حملة STC",
    campaign_id: "cam1", campaign_name: "حملة رمضان 2025 — STC",
    requested_by: "نورة الزهراني", requested_at: subHours(24), current_level: 2,
    levels: [
      { level: 1, title: "قائد الفريق", approver: "محمد العمري", status: "approved", date: subHours(20), comment: "المحتوى جيد مع بعض التعديلات البسيطة" },
      { level: 2, title: "العميل", approver: "STC", status: "needs_revision", date: subHours(15), comment: "يرجى تغيير لون الشعار في المنشور الأول" },
    ],
    status: "needs_revision", priority: "high",
  },
  {
    id: "app4", type: "contract", title: "عقد مؤثرة نايفوري — رهف محمد",
    description: "مراجعة وتوقيع عقد التعاون لحملة موسم جدة",
    campaign_id: "cam3", campaign_name: "موسم جدة 2025 — نايفوري",
    requested_by: "خالد السلمان", requested_at: subHours(48), current_level: 3,
    levels: [
      { level: 1, title: "قائد الفريق", approver: "محمد العمري", status: "approved", date: subHours(46), comment: null },
      { level: 2, title: "مدير القسم", approver: "أحمد الغامدي", status: "approved", date: subHours(30), comment: "معتمد" },
      { level: 3, title: "العميل", approver: "ريم الدوسري", status: "pending", date: null, comment: null },
    ],
    status: "pending", priority: "medium",
  },
  {
    id: "app5", type: "campaign", title: "موافقة على حملة كودو الصيفية",
    description: "بدء حملة صيف 2025 لمطاعم كودو بميزانية 120,000 ر.س",
    campaign_id: "cam6", campaign_name: "صيف 2025 — مطاعم كودو",
    requested_by: "سارة القحطاني", requested_at: "2025-02-15T09:00:00Z", current_level: 3,
    levels: [
      { level: 1, title: "قائد الفريق", approver: "أحمد الغامدي", status: "approved", date: "2025-02-16T10:00:00Z", comment: "موافق" },
      { level: 2, title: "مدير القسم", approver: "محمد العمري", status: "approved", date: "2025-02-16T14:00:00Z", comment: "معتمد" },
      { level: 3, title: "العميل", approver: "فيصل كودو", status: "approved", date: "2025-02-17T11:00:00Z", comment: "شكراً، موافق على البدء" },
    ],
    status: "approved", priority: "medium",
  },
];

export const mockDocuments: MockDocument[] = [
  { id: "doc1", name: "عقد STC — حملة رمضان 2025.pdf", folder: "contracts", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", file_type: "pdf", file_size: "2.4 MB", version: 2, uploaded_by: "خالد السلمان", uploaded_at: "2025-02-10T10:00:00Z", tags: ["عقد", "رمضان", "STC"] },
  { id: "doc2", name: "بريف إبداعي — لوريال Q2 2025.pdf", folder: "briefs", campaign_id: "cam2", campaign_name: "إطلاق لوريال", client_name: "لوريال", file_type: "pdf", file_size: "1.8 MB", version: 1, uploaded_by: "نورة الزهراني", uploaded_at: "2025-04-20T11:00:00Z", tags: ["بريف", "لوريال"] },
  { id: "doc3", name: "فاتورة STC — مارس 2025.pdf", folder: "invoices", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", file_type: "pdf", file_size: "540 KB", version: 1, uploaded_by: "أحمد الغامدي", uploaded_at: "2025-03-01T08:00:00Z", tags: ["فاتورة", "STC"] },
  { id: "doc4", name: "تقرير أداء حملة كودو الصيفية.xlsx", folder: "reports", campaign_id: "cam6", campaign_name: "صيف كودو", client_name: "كودو", file_type: "xlsx", file_size: "890 KB", version: 1, uploaded_by: "سارة القحطاني", uploaded_at: "2025-05-01T14:00:00Z", tags: ["تقرير", "كودو"] },
  { id: "doc5", name: "عرض تقديمي — نايفوري موسم جدة.pptx", folder: "proposals", campaign_id: "cam3", campaign_name: "موسم جدة نايفوري", client_name: "نايفوري", file_type: "pptx", file_size: "4.2 MB", version: 3, uploaded_by: "ريم الدوسري", uploaded_at: subHours(72), tags: ["عرض", "نايفوري"] },
  { id: "doc6", name: "عقد لجين عمران — STC.pdf", folder: "contracts", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", file_type: "pdf", file_size: "1.1 MB", version: 1, uploaded_by: "خالد السلمان", uploaded_at: "2025-02-15T09:00:00Z", tags: ["عقد", "مؤثر"] },
  { id: "doc7", name: "تقرير أداء لجين عمران.pdf", folder: "reports", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", file_type: "pdf", file_size: "750 KB", version: 1, uploaded_by: "نورة الزهراني", uploaded_at: subHours(48), tags: ["تقرير", "أداء"] },
  { id: "doc8", name: "بريف سدايا يوم التأسيس.docx", folder: "briefs", campaign_id: "cam5", campaign_name: "يوم التأسيس سدايا", client_name: "سدايا", file_type: "docx", file_size: "320 KB", version: 1, uploaded_by: "نورة الزهراني", uploaded_at: subHours(24), tags: ["بريف", "سدايا"] },
  { id: "doc9", name: "عقد عبدالله السدحان — STC.pdf", folder: "contracts", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", file_type: "pdf", file_size: "980 KB", version: 1, uploaded_by: "خالد السلمان", uploaded_at: "2025-02-12T10:00:00Z", tags: ["عقد", "مؤثر"] },
  { id: "doc10", name: "فاتورة لوريال — مايو 2025.pdf", folder: "invoices", campaign_id: "cam2", campaign_name: "إطلاق لوريال", client_name: "لوريال", file_type: "pdf", file_size: "420 KB", version: 1, uploaded_by: "فيصل العتيبي", uploaded_at: subHours(5), tags: ["فاتورة", "لوريال"] },
];

export const mockNotifications: MockNotification[] = [
  { id: "n1", type: "approval", title_ar: "طلب موافقة جديد", body_ar: "قائمة مؤثرين حملة لوريال تنتظر موافقتك", is_read: false, created_at: subHours(1), link: "/approvals" },
  { id: "n2", type: "deadline", title_ar: "مهمة متأخرة", body_ar: "مهمة مراجعة محتوى نايفوري متأخرة بيومين", is_read: false, created_at: subHours(3), link: "/tasks" },
  { id: "n3", type: "client", title_ar: "رد العميل", body_ar: "STC طلبت تعديلات على المحتوى", is_read: false, created_at: subHours(5), link: "/approvals" },
  { id: "n4", type: "task", title_ar: "مهمة جديدة", body_ar: "تم تكليفك: تحضير بريف المؤثرين لنون", is_read: true, created_at: subHours(12), link: "/tasks" },
  { id: "n5", type: "approval", title_ar: "الميزانية معتمدة", body_ar: "تم اعتماد ميزانية حملة كودو الصيفية", is_read: true, created_at: subHours(24), link: "/campaigns" },
  { id: "n6", type: "system", title_ar: "عقد على وشك الانتهاء", body_ar: "عقد STC السنوي ينتهي خلال 15 يوماً", is_read: true, created_at: subHours(48), link: "/documents" },
];

export const mockActivities: MockActivity[] = [
  { id: "act1", type: "stage_change", user: "محمد العمري", user_role: "مدير عام", action_ar: "تقدمت حملة STC إلى مرحلة تتبع الأداء", entity_ar: "حملة رمضان STC", details_ar: "تتبع الأداء", created_at: subHours(2) },
  { id: "act2", type: "approval", user: "أحمد الغامدي", user_role: "مدير القسم", action_ar: "تمت الموافقة على قائمة المؤثرين لحملة لوريال", entity_ar: "حملة لوريال", details_ar: null, created_at: subHours(4) },
  { id: "act3", type: "upload", user: "نورة الزهراني", user_role: "أخصائي مؤثرين", action_ar: "رفع مستند: بريف نايفوري موسم جدة", entity_ar: "مركز المستندات", details_ar: "نايفوري_بريف.pdf", created_at: subHours(6) },
  { id: "act4", type: "price_change", user: "خالد السلمان", user_role: "مدير حسابات", action_ar: "تحديث سعر لجين عمران: 22,000 ← 25,000 ر.س", entity_ar: "المؤثرة: لجين عمران", details_ar: "22,000 ← 25,000 ر.س", created_at: subHours(10) },
  { id: "act5", type: "comment", user: "سارة القحطاني", user_role: "مدير حسابات", action_ar: "إضافة تعليق على حملة سدايا: نحتاج توسعة قائمة المؤثرين", entity_ar: "حملة سدايا", details_ar: "نحتاج توسعة قائمة المؤثرين", created_at: subHours(14) },
  { id: "act6", type: "create", user: "سارة القحطاني", user_role: "مدير حسابات", action_ar: "إنشاء حملة جديدة: يوم التأسيس سدايا", entity_ar: "حملة يوم التأسيس — سدايا", details_ar: null, created_at: subHours(20) },
  { id: "act7", type: "login", user: "ريم الدوسري", user_role: "مدير حسابات", action_ar: "تسجيل دخول إلى النظام", entity_ar: "النظام", details_ar: "متصفح الويب", created_at: subHours(22) },
  { id: "act8", type: "status_change", user: "أحمد الغامدي", user_role: "مدير القسم", action_ar: "تغيير حالة منى الشمري: مختارة ← مرفوضة من العميل", entity_ar: "حملة نايفوري", details_ar: "مختارة ← مرفوضة", created_at: subHours(30) },
  { id: "act9", type: "approval", user: "محمد العمري", user_role: "مدير عام", action_ar: "طلب مراجعة طلب زيادة ميزانية حملة سدايا", entity_ar: "حملة سدايا", details_ar: "طلب مزيداً من التبرير", created_at: subHours(36) },
  { id: "act10", type: "update", user: "نورة الزهراني", user_role: "أخصائي مؤثرين", action_ar: "تحديث بروفايل المؤثر طارق العمر", entity_ar: "المؤثر: طارق العمر", details_ar: "تحديث الأسعار وإحصاءات التفاعل", created_at: subHours(48) },
  { id: "act11", type: "create", user: "محمد العمري", user_role: "مدير عام", action_ar: "إنشاء مهمة جديدة: مراجعة عقود لوريال", entity_ar: "المهام", details_ar: null, created_at: subHours(52) },
  { id: "act12", type: "upload", user: "فيصل العتيبي", user_role: "مستخدم مالي", action_ar: "رفع فاتورة لوريال مايو 2025", entity_ar: "مركز المستندات", details_ar: "فاتورة_لوريال_مايو.pdf", created_at: subHours(60) },
];

export const mockFinanceRecords: MockFinanceRecord[] = [
  { id: "fin1", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", influencer_name: "لجين عمران", influencer_id: "i1", base_cost: 22000, discount: 2000, final_cost: 20000, client_price: 25000, profit_margin: 20, status: "paid", invoice_date: "2025-03-01", payment_date: "2025-03-10" },
  { id: "fin2", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", influencer_name: "عبدالله السدحان", influencer_id: "i4", base_cost: 30000, discount: 0, final_cost: 30000, client_price: 35000, profit_margin: 14.3, status: "paid", invoice_date: "2025-03-01", payment_date: "2025-03-12" },
  { id: "fin3", campaign_id: "cam1", campaign_name: "حملة رمضان 2025", client_name: "STC", influencer_name: "أميرة العيدروس", influencer_id: "i7", base_cost: 18000, discount: 0, final_cost: 18000, client_price: 22000, profit_margin: 18.2, status: "paid", invoice_date: "2025-03-01", payment_date: "2025-03-15" },
  { id: "fin4", campaign_id: "cam2", campaign_name: "إطلاق لوريال", client_name: "لوريال", influencer_name: "أميرة العيدروس", influencer_id: "i7", base_cost: 18000, discount: 0, final_cost: 18000, client_price: 22000, profit_margin: 18.2, status: "invoiced", invoice_date: addDays(-5), payment_date: null },
  { id: "fin5", campaign_id: "cam2", campaign_name: "إطلاق لوريال", client_name: "لوريال", influencer_name: "رهف محمد", influencer_id: "i3", base_cost: 15000, discount: 1000, final_cost: 14000, client_price: 18000, profit_margin: 22.2, status: "pending", invoice_date: null, payment_date: null },
  { id: "fin6", campaign_id: "cam6", campaign_name: "صيف كودو", client_name: "كودو", influencer_name: "منى الشمري", influencer_id: "i5", base_cost: 7000, discount: 0, final_cost: 7000, client_price: 8000, profit_margin: 12.5, status: "paid", invoice_date: "2025-04-15", payment_date: "2025-05-01" },
  { id: "fin7", campaign_id: "cam6", campaign_name: "صيف كودو", client_name: "كودو", influencer_name: "أنس مروان", influencer_id: "i10", base_cost: 18000, discount: 0, final_cost: 18000, client_price: 20000, profit_margin: 10, status: "overdue", invoice_date: "2025-04-15", payment_date: null },
  { id: "fin8", campaign_id: "cam3", campaign_name: "موسم جدة نايفوري", client_name: "نايفوري", influencer_name: "رهف محمد", influencer_id: "i3", base_cost: 15000, discount: 0, final_cost: 15000, client_price: 18000, profit_margin: 16.7, status: "pending", invoice_date: null, payment_date: null },
];

export const mockTeamMembers: MockTeamMember[] = [
  { id: "u1", name: "محمد العمري", role: "admin", email: "m.alomari@crm.sa", tasks_completed: 47, tasks_pending: 3, campaigns_active: 5, productivity_score: 96, avatar_initials: "م ع" },
  { id: "u2", name: "أحمد الغامدي", role: "dept_manager", email: "a.alghamdi@crm.sa", tasks_completed: 38, tasks_pending: 5, campaigns_active: 3, productivity_score: 89, avatar_initials: "أ غ" },
  { id: "u3", name: "نورة الزهراني", role: "influencer_specialist", email: "n.alzahrani@crm.sa", tasks_completed: 62, tasks_pending: 8, campaigns_active: 4, productivity_score: 92, avatar_initials: "ن ز" },
  { id: "u4", name: "سارة القحطاني", role: "account_manager", email: "s.alqahtani@crm.sa", tasks_completed: 55, tasks_pending: 6, campaigns_active: 3, productivity_score: 88, avatar_initials: "س ق" },
  { id: "u5", name: "خالد السلمان", role: "account_manager", email: "k.alsalman@crm.sa", tasks_completed: 41, tasks_pending: 4, campaigns_active: 2, productivity_score: 85, avatar_initials: "خ س" },
  { id: "u6", name: "ريم الدوسري", role: "account_manager", email: "r.aldosari@crm.sa", tasks_completed: 29, tasks_pending: 7, campaigns_active: 2, productivity_score: 78, avatar_initials: "ر د" },
  { id: "u7", name: "فيصل العتيبي", role: "finance_user", email: "f.alotaibi@crm.sa", tasks_completed: 33, tasks_pending: 2, campaigns_active: 1, productivity_score: 91, avatar_initials: "ف ع" },
];
