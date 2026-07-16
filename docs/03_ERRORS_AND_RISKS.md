# 03 — Errors & Risks Register
**تاريخ التدقيق:** 2026-07-16  
**المنهجية:** مرتّب من الأشد خطورة إلى الأقل

---

## 🔴 Critical

---

### [C-1] RLS لا يُعزل البيانات بين المستخدمين

**الوصف:**  
جميع سياسات RLS تعتمد فقط على `auth.role() = 'authenticated'`.  
أي مستخدم مُسجَّل يملك صلاحية قراءة/تعديل/حذف **جميع** سجلات النظام.

**الأثر:** في بيئة متعددة المستخدمين، موظف في شركة يمكنه رؤية وتعديل بيانات شركة أخرى إذا شاركا نفس Supabase project.

**الدليل من الكود:**
```sql
create policy "Clients: authenticated CRUD"
  on public.clients for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
-- نفس النمط على: influencers, projects, project_influencers, tasks
```

**الإصلاح المقترح (غير منفَّذ):** إضافة عمود `organization_id` أو سياسات تعتمد على `auth.uid()`.

---

### [C-2] Demo Mode يتجاوز المصادقة كلياً

**الوصف:**  
عند غياب `VITE_SUPABASE_URL` أو `VITE_SUPABASE_ANON_KEY`، يُسجَّل المستخدم تلقائياً بصلاحيات `admin` دون أي كلمة مرور.

**الأثر:** أي شخص يصل لـ URL التطبيق المنشور بدون إعداد Supabase يدخل مباشرة كمدير كامل الصلاحيات.

**الدليل من الكود:**
```typescript
// AuthContext.tsx
if (!isSupabaseConfigured) {
  setUser({ id: "demo-user", email: mockProfile.email } as User);
  setProfile(mockProfile);  // { role: "admin" }
  setLoading(false);
  return;
}
```

**الإصلاح المقترح (غير منفَّذ):** في بيئة الإنتاج، يجب التأكد دائماً من إعداد `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`.

---

## 🟠 High

---

### [H-1] 11 من 17 وحدة لا تحفظ البيانات في قاعدة البيانات

**الوصف:**  
الوحدات التالية تعمل على `useState` محلي فقط — جميع التعديلات تضيع عند تحديث الصفحة:
- Clients, Campaigns, Influencers, Approvals, Finance, Documents, ActivityLog, Calendar, UsersRoles, CampaignDetail, ClientDetail

**الأثر:** التطبيق غير قابل للاستخدام في بيئة إنتاجية حقيقية لـ 70% من وظائفه.

---

### [H-2] تعارض Schema بين DB والواجهة في جدول `clients`

**الوصف:**  
جدول `clients` في DB يملك 11 حقلاً بسيطاً. واجهة Clients.tsx تستخدم نوع `MockEnterpriseClient` الذي يختلف جذرياً.

**الأثر:** الاتصال المباشر بـ Supabase لجدول clients سيفشل — الحقول `brand_name, cr_number, vat_subject, contract_start_date` إلخ غير موجودة في DB.

**قائمة الحقول المفقودة من DB:**
```
brand_name, legal_company_name, cr_number, cr_expiry_date, vat_subject,
vat_number, vat_expiry_date, company_type, contract_start_date,
contract_end_date, has_contract, contract_notes, priority,
responsible_employee_id, campaign_team, attachments
```

---

### [H-3] تعارض Schema بين DB والواجهة في جدول `tasks`

**الوصف:**  
جدول `tasks` في DB يفتقد: `campaign_id, campaign_name, client_name, assigned_by, campaign_leader, department, task_type, time_logs`.

**الأثر:** عند الاتصال بـ Supabase، بيانات الحملة والفريق والنوع تُفقَد عند الحفظ.

**الدليل من الكود:**
```typescript
// Tasks.tsx — base object المُرسَل لـ Supabase
const base = {
  title: form.title, description: form.description,
  project_id: form.project_id || null,
  assignee_id: form.assignee_id || null,
  status: form.status, priority: form.priority,
  due_date: form.due_date || null,
  // campaign_id, department, task_type ← لا تُرسَل
};
```

---

### [H-4] تعارض قيم `role` بين DB والواجهة

**الوصف:**  
DB يقيّد `profiles.role` بـ 3 قيم فقط. واجهة UsersRoles تعرض 9 أدوار.

| قيم DB | قيم الواجهة الإضافية (ستُرفض) |
|--------|-------------------------------|
| admin, manager, employee | dept_manager, team_leader, influencer_specialist, account_manager, finance_user, client_user |

**الأثر:** إنشاء مستخدم بدور `account_manager` من الواجهة سيفشل بـ constraint violation.

---

### [H-5] Build يفشل بدون `PORT` env var

**الوصف:**
```
Error: PORT environment variable is required but was not provided.
  at vite.config.ts:10
```

**الأثر:** لا يمكن بناء bundle الإنتاج من CLI مباشرة — يعتمد على workflow Replit فقط.

**ملاحظة:** هذا قيد تصميمي من بيئة Replit، لكنه يُعيق أي pipeline CI/CD خارجي.

---

### [H-6] لا يوجد جدول `campaigns` في قاعدة البيانات

**الوصف:**  
الوحدة الأهم في النظام (Campaigns) لا يوجد لها أي جدول في `supabase-schema.sql`.

**الأثر:** المركز الأساسي للعمل في شركة تسويق بالمؤثرين غير مستمر في DB.

---

## 🟡 Medium

---

### [M-1] `supabase` يُصدَّر كـ `null as unknown` — خطر crash

**الوصف:**
```typescript
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);
```
TypeScript لا يكشف عن استدعاء `supabase.from(...)` بدون فحص `isSupabaseConfigured`.

**الأثر:** استدعاء خاطئ واحد بدون guard ينتج `TypeError: Cannot read properties of null`.

**الصفحات المعرّضة للخطر:** كل صفحة HYBRID تستخدم Supabase.

---

### [M-2] `profiles` مكشوف بالكامل لجميع المستخدمين

**الوصف:**
```sql
create policy "Profiles: authenticated can view all"
  on public.profiles for select
  using (auth.role() = 'authenticated');
```
أي مستخدم يرى emails وأسماء وأدوار جميع المستخدمين الآخرين.

---

### [M-3] لا يوجد `created_by` في أي جدول

**الوصف:** لا يوجد عمود `created_by` أو `user_id` في clients, projects, tasks.

**الأثر:** لا يمكن تطبيق RLS على مستوى "أرى فقط ما أنشأته" مستقبلاً.

---

### [M-4] الـ `project_influencers` Junction Table غير مستخدمة من الـ UI

**الوصف:** الجدول موجود في Schema لكن لا توجد صفحة أو component يقرأ منه أو يكتب إليه.

---

### [M-5] `Reports.tsx` يستعلم `influencers` من Supabase لكن `Influencers.tsx` لا يكتب فيه

**الوصف:** Reports.tsx:  
```typescript
supabase.from("influencers").select("platform")
```
لكن Influencers.tsx يعمل على mock فقط — جدول influencers في Supabase سيكون فارغاً، مما يُعطي تقارير ناقصة.

---

### [M-6] لا يوجد معالجة لـ Supabase errors في بعض الصفحات

**الوصف:** بعض استعلامات Supabase لا تتحقق من `error` في الرد:
```typescript
const { data } = await supabase.from("projects").select("...");
// data قد يكون null بدون معالجة error
```

---

### [M-7] `mockProfile.role = "admin"` ثابت في Demo Mode

**الوصف:** لا يمكن اختبار صلاحيات الأدوار الأخرى في Demo Mode دون تعديل الكود مباشرة.

---

## 🔵 Low

---

### [L-1] تواريخ mock data ثابتة نسبياً لـ `today`

**الوصف:** `enterpriseData.ts` و `mockData.ts` يحسبان التواريخ بـ `addDays()` من وقت التحميل.  
**الأثر:** بعض mock tasks قد تظهر "overdue" أو "upcoming" بشكل مختلف في أوقات مختلفة.

---

### [L-2] `framer-motion` و `react-icons` مستوردتان لكن استخدامهما محدود

**الوصف:** حجم bundle أكبر من اللازم.

---

### [L-3] لا يوجد `loading` state في بعض عمليات الحذف

**الوصف:** زر الحذف لا يُعطّل نفسه أثناء الطلب — يمكن النقر مرتين.

---

### [L-4] عدم تطابق أسماء الـ secrets

**الوصف:**  
- الكود يستخدم: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`  
- المستخدم ذكر: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (بدون `VITE_`)

**الأثر:** إضافة الـ secrets بالأسماء الخاطئة لن يُفعّل Supabase.

---

## ملخص الأرقام

| الخطورة | العدد |
|---------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 6 |
| 🟡 Medium | 7 |
| 🔵 Low | 4 |
| **المجموع** | **19** |
