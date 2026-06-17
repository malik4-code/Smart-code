import type { Client, Influencer, Project, Task, Profile } from "./supabase";

export const mockProfile: Profile = {
  id: "demo-user",
  email: "demo@influencecrm.com",
  full_name: "محمد العمري",
  role: "admin",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export const mockClients: Client[] = [
  { id: "c1", name: "شركة سدايا للتقنية", industry: "تقنية المعلومات", email: "info@sdaia.gov.sa", phone: "+966112345678", address: "الرياض", website: "sdaia.gov.sa", contact_person: "أحمد الغامدي", status: "active", notes: "", created_at: "2025-01-10T00:00:00Z", updated_at: "2025-01-10T00:00:00Z" },
  { id: "c2", name: "مجموعة STC للاتصالات", industry: "اتصالات", email: "marketing@stc.com.sa", phone: "+966112223344", address: "الرياض", website: "stc.com.sa", contact_person: "سارة القحطاني", status: "active", notes: "", created_at: "2025-01-15T00:00:00Z", updated_at: "2025-01-15T00:00:00Z" },
  { id: "c3", name: "علامة لوريال المملكة", industry: "جمال وعناية", email: "contact@loreal-sa.com", phone: "+966556677889", address: "جدة", website: "loreal-sa.com", contact_person: "نورة الزهراني", status: "active", notes: "", created_at: "2025-02-01T00:00:00Z", updated_at: "2025-02-01T00:00:00Z" },
  { id: "c4", name: "أكاديمية نون التعليمية", industry: "تعليم", email: "hello@noon.academy", phone: "+966598001122", address: "الرياض", website: "noon.academy", contact_person: "خالد السلمان", status: "active", notes: "", created_at: "2025-02-10T00:00:00Z", updated_at: "2025-02-10T00:00:00Z" },
  { id: "c5", name: "مطاعم كودو", industry: "مطاعم وضيافة", email: "brand@kudu.com.sa", phone: "+966112009988", address: "الدمام", website: "kudu.com.sa", contact_person: "فيصل العتيبي", status: "inactive", notes: "عميل موسمي", created_at: "2025-03-01T00:00:00Z", updated_at: "2025-03-01T00:00:00Z" },
  { id: "c6", name: "نايفوري للجواهر", industry: "مجوهرات وأزياء", email: "pr@nayifory.com", phone: "+966501234567", address: "الرياض", website: "nayifory.com", contact_person: "ريم الدوسري", status: "active", notes: "", created_at: "2025-03-15T00:00:00Z", updated_at: "2025-03-15T00:00:00Z" },
];

export const mockInfluencers: Influencer[] = [
  { id: "i1", name: "لجين عمران", platform: "instagram", category: "lifestyle", city: "الرياض", followers: 4200000, engagement_rate: 3.8, estimated_price: 25000, email: "lojain@agency.com", phone: "+966501112233", notes: "", created_at: "2025-01-05T00:00:00Z", updated_at: "2025-01-05T00:00:00Z" },
  { id: "i2", name: "بدر سالم", platform: "youtube", category: "entertainment", city: "جدة", followers: 8900000, engagement_rate: 6.2, estimated_price: 45000, email: "bader@mgmt.sa", phone: "+966512223344", notes: "أكثر من 300 مليون مشاهدة", created_at: "2025-01-08T00:00:00Z", updated_at: "2025-01-08T00:00:00Z" },
  { id: "i3", name: "رهف محمد", platform: "tiktok", category: "fashion", city: "الرياض", followers: 2100000, engagement_rate: 9.4, estimated_price: 18000, email: "rahaf@creator.sa", phone: "+966534445566", notes: "", created_at: "2025-01-12T00:00:00Z", updated_at: "2025-01-12T00:00:00Z" },
  { id: "i4", name: "عبدالله السدحان", platform: "snapchat", category: "entertainment", city: "الرياض", followers: 5600000, engagement_rate: 7.1, estimated_price: 35000, email: "info@alsudhan.sa", phone: "+966556667788", notes: "", created_at: "2025-01-20T00:00:00Z", updated_at: "2025-01-20T00:00:00Z" },
  { id: "i5", name: "منى الشمري", platform: "instagram", category: "food", city: "المدينة المنورة", followers: 890000, engagement_rate: 5.5, estimated_price: 8000, email: "mona@foodie.sa", phone: "+966567778899", notes: "", created_at: "2025-01-25T00:00:00Z", updated_at: "2025-01-25T00:00:00Z" },
  { id: "i6", name: "طارق العمر", platform: "youtube", category: "tech", city: "الدمام", followers: 1350000, engagement_rate: 4.9, estimated_price: 12000, email: "tarek@techreview.sa", phone: "+966578889900", notes: "", created_at: "2025-02-01T00:00:00Z", updated_at: "2025-02-01T00:00:00Z" },
  { id: "i7", name: "أميرة العيدروس", platform: "instagram", category: "beauty", city: "جدة", followers: 3100000, engagement_rate: 4.3, estimated_price: 22000, email: "amira@beauty.sa", phone: "+966589990011", notes: "", created_at: "2025-02-05T00:00:00Z", updated_at: "2025-02-05T00:00:00Z" },
  { id: "i8", name: "سلطان الزين", platform: "tiktok", category: "sports", city: "الرياض", followers: 1800000, engagement_rate: 11.2, estimated_price: 14000, email: "sultan@sports.sa", phone: "+966590001122", notes: "", created_at: "2025-02-10T00:00:00Z", updated_at: "2025-02-10T00:00:00Z" },
  { id: "i9", name: "هيفاء المنصور", platform: "twitter", category: "lifestyle", city: "الرياض", followers: 670000, engagement_rate: 2.8, estimated_price: 6500, email: "haifa@media.sa", phone: "+966511223344", notes: "", created_at: "2025-02-15T00:00:00Z", updated_at: "2025-02-15T00:00:00Z" },
  { id: "i10", name: "أنس مروان", platform: "snapchat", category: "travel", city: "الطائف", followers: 2400000, engagement_rate: 6.8, estimated_price: 20000, email: "anas@travel.sa", phone: "+966522334455", notes: "", created_at: "2025-02-20T00:00:00Z", updated_at: "2025-02-20T00:00:00Z" },
];

const today = new Date();
const addDays = (d: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split("T")[0];
};

type MockProject = Omit<Project, "client" | "project_influencers"> & { client?: { name: string } };
export const mockProjects: MockProject[] = [
  { id: "p1", name: "حملة رمضان 2025 - STC", client_id: "c2", description: "حملة تسويقية شاملة خلال شهر رمضان المبارك", budget: 350000, status: "completed", start_date: "2025-02-20", end_date: "2025-04-05", created_at: "2025-02-01T00:00:00Z", updated_at: "2025-04-05T00:00:00Z", client: { name: "مجموعة STC للاتصالات" } },
  { id: "p2", name: "إطلاق منتج جديد - لوريال", client_id: "c3", description: "إطلاق خط عناية جديد للبشرة بالتعاون مع مؤثرين", budget: 180000, status: "active", start_date: "2025-05-01", end_date: addDays(30), created_at: "2025-04-15T00:00:00Z", updated_at: "2025-05-01T00:00:00Z", client: { name: "علامة لوريال المملكة" } },
  { id: "p3", name: "موسم جدة - نايفوري", client_id: "c6", description: "حملة موسم جدة مع مؤثرات الأزياء", budget: 220000, status: "active", start_date: "2025-05-15", end_date: addDays(45), created_at: "2025-05-01T00:00:00Z", updated_at: "2025-05-15T00:00:00Z", client: { name: "نايفوري للجواهر" } },
  { id: "p4", name: "العودة للدراسة - نون", client_id: "c4", description: "حملة موسم العودة المدرسية 2025", budget: 95000, status: "planning", start_date: addDays(20), end_date: addDays(60), created_at: "2025-05-20T00:00:00Z", updated_at: "2025-05-20T00:00:00Z", client: { name: "أكاديمية نون التعليمية" } },
  { id: "p5", name: "يوم التأسيس - سدايا", client_id: "c1", description: "حملة احتفالية بيوم التأسيس السعودي", budget: 420000, status: "planning", start_date: addDays(40), end_date: addDays(80), created_at: "2025-05-22T00:00:00Z", updated_at: "2025-05-22T00:00:00Z", client: { name: "شركة سدايا للتقنية" } },
];

type MockTask = Omit<Task, "project"> & { project?: { name: string } };
export const mockTasks: MockTask[] = [
  { id: "t1", title: "إرسال عقود المؤثرين - لوريال", description: "", project_id: "p2", assignee_id: null, status: "completed", priority: "high", due_date: addDays(-5), created_at: "2025-05-01T00:00:00Z", updated_at: "2025-05-01T00:00:00Z", project: { name: "إطلاق منتج جديد - لوريال" } },
  { id: "t2", title: "مراجعة المحتوى المنشور - نايفوري", description: "", project_id: "p3", assignee_id: null, status: "in_progress", priority: "medium", due_date: addDays(2), created_at: "2025-05-15T00:00:00Z", updated_at: "2025-05-20T00:00:00Z", project: { name: "موسم جدة - نايفوري" } },
  { id: "t3", title: "تحضير بريف المؤثرين - نون", description: "", project_id: "p4", assignee_id: null, status: "pending", priority: "medium", due_date: addDays(7), created_at: "2025-05-20T00:00:00Z", updated_at: "2025-05-20T00:00:00Z", project: { name: "العودة للدراسة - نون" } },
  { id: "t4", title: "الاجتماع التنسيقي مع فريق لوريال", description: "", project_id: "p2", assignee_id: null, status: "in_progress", priority: "high", due_date: addDays(1), created_at: "2025-05-18T00:00:00Z", updated_at: "2025-05-18T00:00:00Z", project: { name: "إطلاق منتج جديد - لوريال" } },
  { id: "t5", title: "إعداد تقرير أداء حملة STC", description: "", project_id: "p1", assignee_id: null, status: "completed", priority: "low", due_date: addDays(-10), created_at: "2025-04-10T00:00:00Z", updated_at: "2025-04-15T00:00:00Z", project: { name: "حملة رمضان 2025 - STC" } },
  { id: "t6", title: "اختيار المؤثرين - سدايا", description: "", project_id: "p5", assignee_id: null, status: "pending", priority: "urgent", due_date: addDays(10), created_at: "2025-05-22T00:00:00Z", updated_at: "2025-05-22T00:00:00Z", project: { name: "يوم التأسيس - سدايا" } },
  { id: "t7", title: "تسليم محتوى المنشورات - لوريال", description: "", project_id: "p2", assignee_id: null, status: "pending", priority: "high", due_date: addDays(5), created_at: "2025-05-15T00:00:00Z", updated_at: "2025-05-15T00:00:00Z", project: { name: "إطلاق منتج جديد - لوريال" } },
  { id: "t8", title: "متابعة تحليلات نايفوري", description: "", project_id: "p3", assignee_id: null, status: "pending", priority: "low", due_date: addDays(14), created_at: "2025-05-20T00:00:00Z", updated_at: "2025-05-20T00:00:00Z", project: { name: "موسم جدة - نايفوري" } },
];
