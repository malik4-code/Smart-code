# 02 — Modules & Routes
**تاريخ التدقيق:** 2026-07-16

---

## 1. خريطة المسارات الكاملة

```
/login                  → Login.tsx           (AuthRoute — يُعيد توجيه المسجّل)
/                       → Dashboard.tsx        (ProtectedRoute)
/campaigns              → Campaigns.tsx        (ProtectedRoute)
/campaigns/:id          → CampaignDetail.tsx   (ProtectedRoute)
/clients                → Clients.tsx          (ProtectedRoute)
/clients/:id            → ClientDetail.tsx     (ProtectedRoute)
/influencers            → Influencers.tsx      (ProtectedRoute)
/projects               → Projects.tsx         (ProtectedRoute)
/tasks                  → Tasks.tsx            (ProtectedRoute)
/approvals              → Approvals.tsx        (ProtectedRoute)
/finance                → Finance.tsx          (ProtectedRoute)
/documents              → Documents.tsx        (ProtectedRoute)
/activity               → ActivityLog.tsx      (ProtectedRoute)
/calendar               → CalendarPage.tsx     (ProtectedRoute)
/reports                → Reports.tsx          (ProtectedRoute)
/users-roles            → UsersRoles.tsx       (ProtectedRoute)
*                       → NotFound.tsx
```

**ProtectedRoute:** يتحقق من وجود `user` في `AuthContext`. إذا لم يوجد، يُعيد توجيهاً إلى `/login`.  
**ملاحظة:** في Demo Mode، `user` يُعيَّن تلقائياً — جميع المسارات مفتوحة فوراً.

---

## 2. تفاصيل كل وحدة

---

### 🟢 Login — `/login`
**الملف:** `Login.tsx` (110 سطر)  
**حالة البيانات:** SUPABASE_CONNECTED  
**الوظائف:**
- تسجيل دخول بـ email/password عبر `supabase.auth.signInWithPassword()`
- يعرض تحذير "Demo Mode" عند عدم تهيئة Supabase
- الزر معطّل (`disabled`) عند عدم تهيئة Supabase
- دعم كامل ar/en + RTL/LTR

**ما لا يدعمه:** إعادة تعيين كلمة المرور، التسجيل الذاتي (sign-up)، OAuth

---

### 🟡 Dashboard — `/`
**الملف:** `Dashboard.tsx` (284 سطر)  
**حالة البيانات:** HYBRID  
**الوظائف:**
- بطاقات إحصاء: clients, projects, pending tasks, active campaigns, overdue tasks, total revenue
- جدول Recent Campaigns (من `mockCampaigns` دائماً)
- جدول Recent Projects (من Supabase أو mock)
- قائمة Recent Tasks (من Supabase أو mock)

**Supabase Queries (عند التهيئة):**
```typescript
supabase.from("clients").select("*").order("created_at").limit(5)
supabase.from("tasks").select("*").order("created_at").limit(5)
supabase.from("projects").select("*, client:clients(name)").order("created_at").limit(5)
```

**ملاحظة:** إحصائيات `activeCampaigns` و`pendingApprovals` و`totalRevenue` تأتي دائماً من Mock حتى مع تهيئة Supabase (لا يوجد جدول campaigns في DB).

---

### 🔴 Clients — `/clients`
**الملف:** `Clients.tsx` (754 سطر) + `ClientDetail.tsx` (693 سطر)  
**حالة البيانات:** DEMO_ONLY  
**الوظائف:**
- قائمة عملاء مع بحث وفلترة
- معالج 5 خطوات (Wizard): basic → address → contract → attachments → team
- عرض تفاصيل العميل: campaigns مرتبطة، مستندات، فواتير، ملاحظات، سجل نشاط
- تتبع انتهاء العقد مع تنبيهات (x أيام متبقية)

**مصدر البيانات:** `mockEnterpriseClients` (enterpriseData.ts) — نوع `MockEnterpriseClient` مختلف كلياً عن `Client` في Supabase

**عمليات CRUD:** تعمل على `useState` المحلي فقط — لا تُحفظ عند تحديث الصفحة

**حقول الواجهة غير موجودة في DB:**  
brand_name, legal_company_name, cr_number, cr_expiry_date, vat_subject, vat_number, company_type, contract_start_date, contract_end_date, has_contract, priority, responsible_employee, campaign_team[], attachments[]

---

### 🔴 Campaigns — `/campaigns` + `/campaigns/:id`
**الملفات:** `Campaigns.tsx` (612 سطر) + `CampaignDetail.tsx` (600 سطر)  
**حالة البيانات:** DEMO_ONLY  
**الوظائف:**
- قائمة حملات مع بحث/فلترة
- نموذج إنشاء حملة: name, client, team_leader, account_manager, budget, brand, product_link, brand_link, platforms (SVG icons), categories, campaign_team, objective, notes
- صفحة تفاصيل: 15 مرحلة workflow، SLA tracking، جدول مؤثرين، Campaign Workspace (6 تبويبات)
- "Start Working On Campaign" button يفتح workspace

**مصدر البيانات:** `mockCampaigns` (نوع `MockCampaign`) — لا يوجد جدول `campaigns` في DB أصلاً

**عمليات CRUD:** إضافة حملة تُدرج في `mockCampaigns` array في الذاكرة فقط

---

### 🔴 Influencers — `/influencers`
**الملف:** `Influencers.tsx` (644 سطر)  
**حالة البيانات:** DEMO_ONLY  
**الوظائف:**
- قائمة مؤثرين مع بحث، فلترة (platform, category, followers range)
- نموذج إنشاء/تعديل شامل: platform, category, followers, engagement_rate, price, discount_price, gender, language, is_favorite, is_blacklisted
- عرض بطاقة تفاصيل المؤثر

**مصدر البيانات:** `mockInfluencers` (mockData.ts) — نوع `Influencer` متوافق مع Supabase لكن بدون اتصال

**ملاحظة:** هذه الصفحة هي **الأقرب للجاهزية** للاتصال بـ Supabase — الحقول الأساسية متطابقة تقريباً. تحتاج إضافة: gender, language, discount_price, is_favorite, is_blacklisted, username, country, avg_views.

---

### 🟡 Projects — `/projects`
**الملف:** `Projects.tsx` (274 سطر)  
**حالة البيانات:** HYBRID ✅  
**الوظائف:**
- CRUD كامل متصل بـ Supabase: create, update, delete projects
- جلب clients من Supabase للـ select
- Fallback لـ mockProjects + mockClients عند عدم تهيئة Supabase

**Supabase Queries:**
```typescript
supabase.from("projects").select("*, client:clients(name)")
supabase.from("clients").select("id, name").eq("status","active")
supabase.from("projects").insert(payload)
supabase.from("projects").update({...}).eq("id", id)
supabase.from("projects").delete().eq("id", id)
```

---

### 🟡 Tasks — `/tasks`
**الملف:** `Tasks.tsx` (541 سطر)  
**حالة البيانات:** HYBRID ⚠️ (مع تحفظات)  
**الوظائف:**
- CRUD متصل بـ Supabase لحقول الـ core: title, description, project_id, assignee_id, status, priority, due_date
- حقول إضافية (campaign_id, department, task_type, assigned_by, campaign_leader) تُحفظ في state فقط — **لا تُرسَل لـ Supabase** (غير موجودة في جدول DB)
- فلترة متعددة: by status, priority, campaign
- Time tracking في WorkLog (local state فقط)

**Supabase Queries:**
```typescript
supabase.from("tasks").select("*, project:projects(name,client_id)")
supabase.from("projects").select("id, name")
supabase.from("tasks").insert(base)     // base لا يشمل الحقول الإضافية
supabase.from("tasks").update({...base})
supabase.from("tasks").delete().eq("id",id)
```

---

### 🔴 Approvals — `/approvals`
**الملف:** `Approvals.tsx` (201 سطر)  
**حالة البيانات:** DEMO_ONLY  
**الوظائف:**
- عرض قائمة موافقات مع فلترة (pending/approved/rejected)
- أزرار Approve/Reject/Request Revision — لا تحفظ شيئاً
- عرض approval chain متعدد المستويات

---

### 🔴 Finance — `/finance`
**الملف:** `Finance.tsx` (183 سطر)  
**حالة البيانات:** DEMO_ONLY  
**الوظائف:**
- إحصاءات مالية: total revenue, cost, profit, margin
- جدول سجلات مالية لكل مؤثر/حملة
- رسوم بيانية (bar chart)
- لا يوجد CRUD

---

### 🔴 Documents — `/documents`
**الملف:** `Documents.tsx` (181 سطر)  
**حالة البيانات:** DEMO_ONLY  
**الوظائف:**
- مستعرض مستندات مع مجلدات (contracts/proposals/reports/invoices/briefs)
- بحث وفلترة
- رفع مستند: لا يُحفظ (demo mode فقط)

---

### 🟡 Reports — `/reports`
**الملف:** `Reports.tsx` (220 سطر)  
**حالة البيانات:** HYBRID  
**الوظائف:**
- رسوم بيانية: projects by status, tasks by status, influencers by platform, clients by status
- يجلب البيانات من Supabase عند التهيئة (4 استعلامات متوازية)
- يعرض mock data بدون Supabase

---

### 🔴 UsersRoles — `/users-roles`
**الملف:** `UsersRoles.tsx` (322 سطر)  
**حالة البيانات:** DEMO_ONLY  
**الوظائف:**
- عرض أعضاء الفريق مع أدوارهم (9 أدوار)
- ViewAs: محاكاة عرض النظام من منظور مستخدم آخر (UI cosmetic فقط)
- شبكة صلاحيات (permissions matrix) — بيانات ثابتة

---

## 3. ملخص مستوى الاكتمال

```
مكتمل وقابل للإنتاج:        1 صفحة  (6%)   — Login
هجين (يحتاج إكمال DB):     4 صفحات (24%)  — Dashboard, Projects, Tasks, Reports
تجريبي (يحتاج ربط كامل):  12 صفحة (70%)  — الباقي
```

---

## 4. الوحدات التي تتشارك البيانات مع Supabase

| جدول Supabase | يُستخدم في |
|---------------|-----------|
| `clients` | Dashboard (read), Projects (FK) |
| `influencers` | Reports (read) |
| `projects` | Dashboard (read), Projects (CRUD), Tasks (read FK), Reports (read) |
| `tasks` | Dashboard (read), Tasks (CRUD), Reports (read) |
| `profiles` | AuthContext (read) |
| `project_influencers` | غير مستخدم من أي صفحة حالياً |
