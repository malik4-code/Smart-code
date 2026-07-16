# 04 — Recommended Next Sprint
**تاريخ الإعداد:** 2026-07-16  
**الأولوية:** الأمان + قاعدة البيانات + الربط الحقيقي  
**القيود:** لا WhatsApp، لا AI، لا APIs خارجية

---

## اسم الـ Sprint

**Sprint 1 — "Foundation: Security & Real Data Layer"**  
**الهدف:** تحويل النظام من Demo إلى Production-Ready في 3 وحدات أساسية، مع إصلاح جميع مشكلات الأمان الحرجة.

**المدة المقترحة:** 2 أسبوع  
**الأولوية العليا:** الأمان أولاً، ثم قاعدة البيانات، ثم الربط.

---

## المهام (مرتبة حسب الأولوية)

---

### T-1: إصلاح RLS — عزل البيانات على مستوى المستخدم
**الأولوية:** 🔴 Critical  
**المرجع:** C-1 في تقرير المخاطر  

**المطلوب:**
1. إضافة عمود `organization_id uuid` على جداول: clients, projects, tasks, influencers
2. تعديل سياسات RLS لتصفية البيانات حسب `organization_id`:
   ```sql
   -- مثال على السياسة الصحيحة
   create policy "clients: org isolation"
     on public.clients for all
     using (organization_id = (
       select organization_id from profiles where id = auth.uid()
     ));
   ```
3. إضافة عمود `organization_id` على `profiles`
4. تحديث `supabase-schema.sql` بالتغييرات

**معيار القبول:**
- [ ] مستخدم من org A لا يرى بيانات org B عند الاستعلام المباشر
- [ ] سياسة INSERT تملأ `organization_id` تلقائياً من profile المستخدم
- [ ] سياسة DELETE تمنع حذف سجلات org أخرى

---

### T-2: توسيع `profiles.role` ليشمل جميع الأدوار التسعة
**الأولوية:** 🟠 High  
**المرجع:** H-4 في تقرير المخاطر  

**المطلوب:**
1. تعديل `CHECK` constraint في `profiles`:
   ```sql
   alter table public.profiles
     drop constraint profiles_role_check;
   alter table public.profiles
     add constraint profiles_role_check check (role in (
       'admin', 'manager', 'dept_manager', 'team_leader',
       'employee', 'influencer_specialist', 'account_manager',
       'finance_user', 'client_user'
     ));
   ```
2. تحديث `supabase.ts` interface لـ `Profile.role`
3. تحديث `supabase-schema.sql`

**معيار القبول:**
- [ ] INSERT بدور `account_manager` ينجح في Supabase
- [ ] TypeScript interface `Profile.role` يعكس الـ 9 قيم
- [ ] typecheck يمر بدون أخطاء

---

### T-3: توسيع Schema جدول `clients`
**الأولوية:** 🟠 High  
**المرجع:** H-2 في تقرير المخاطر  

**المطلوب:**
```sql
alter table public.clients
  add column brand_name text,
  add column legal_company_name text,
  add column cr_number text,
  add column cr_expiry_date date,
  add column vat_subject boolean default false,
  add column vat_number text,
  add column company_type text,
  add column contract_start_date date,
  add column contract_end_date date,
  add column has_contract boolean default false,
  add column contract_notes text,
  add column priority text default 'medium'
    check (priority in ('high','medium','low')),
  add column responsible_employee_id uuid
    references public.profiles(id) on delete set null,
  add column status text not null default 'prospect'
    check (status in ('prospect','active','inactive','suspended','contract_ended'));
-- ملاحظة: contract_status = 'active' تعارض مع القيود الحالية، يجب DROP ثم إعادة إنشاء CHECK
```
- تحديث `supabase.ts` interface `Client`
- تحديث `supabase-schema.sql`

**معيار القبول:**
- [ ] جميع حقول Clients.tsx الأساسية موجودة في DB
- [ ] INSERT من Clients.tsx لا يرمي خطأ column mismatch
- [ ] typecheck يمر بدون أخطاء

---

### T-4: توسيع Schema جدول `tasks`
**الأولوية:** 🟠 High  
**المرجع:** H-3 في تقرير المخاطر  

**المطلوب:**
```sql
alter table public.tasks
  add column campaign_id text,           -- مؤقتاً text حتى إنشاء جدول campaigns
  add column campaign_name text,         -- denormalized للعرض
  add column client_name text,           -- denormalized للعرض
  add column assigned_by uuid references public.profiles(id) on delete set null,
  add column campaign_leader uuid references public.profiles(id) on delete set null,
  add column department text,
  add column task_type text check (task_type in (
    'influencer_selection','creative_design','video_production','photography',
    'content_writing','media_buying','event_management','reporting','other'
  ));
```
- تحديث `supabase.ts` interface `Task`
- تحديث `Tasks.tsx` → إرسال الحقول الجديدة لـ Supabase في `base` object

**معيار القبول:**
- [ ] الحقول: campaign_name, department, task_type تُحفظ في DB عند إنشاء مهمة
- [ ] تحميل المهام يستعيد جميع الحقول بشكل صحيح
- [ ] typecheck يمر بدون أخطاء

---

### T-5: ربط `Clients.tsx` بـ Supabase
**الأولوية:** 🟠 High (يعتمد على T-3)  
**المتطلبات:** T-1, T-3  

**المطلوب:**
1. استبدال `mockEnterpriseClients` بـ `useState` + `useEffect` يجلب من Supabase
2. تطبيق نفس نمط HYBRID المستخدم في Projects.tsx
3. CRUD حقيقي: INSERT/UPDATE/DELETE على جدول `clients`
4. الـ Fallback للـ mock عند عدم تهيئة Supabase يبقى كما هو

**معيار القبول:**
- [ ] إضافة عميل جديد يظهر بعد تحديث الصفحة
- [ ] تعديل عميل يُحدَّث في DB
- [ ] حذف عميل يُزال من DB
- [ ] عند عدم تهيئة Supabase، تعمل الصفحة بالـ mock كالمعتاد

---

### T-6: ربط `Influencers.tsx` بـ Supabase
**الأولوية:** 🟠 High (أبسط وحدة للربط)  
**المتطلبات:** T-1  

**المطلوب:**
1. إضافة حقول الـ enterprise لجدول `influencers`:
   ```sql
   alter table public.influencers
     add column username text,
     add column country text,
     add column gender text check (gender in ('male','female')),
     add column language text check (language in ('arabic','english','bilingual')),
     add column avg_views integer,
     add column discount_price decimal(12,2),
     add column is_favorite boolean default false,
     add column is_blacklisted boolean default false;
   ```
2. استبدال `mockInfluencers` بـ Supabase queries في Influencers.tsx
3. CRUD حقيقي مطابق لنمط Projects.tsx

**معيار القبول:**
- [ ] إضافة مؤثر جديد تظهر بعد تحديث الصفحة
- [ ] الحقول الجديدة (gender, language, is_favorite) تُحفظ بشكل صحيح
- [ ] Reports.tsx يعرض بيانات المؤثرين الحقيقية

---

### T-7: إصلاح `L-4` — توثيق أسماء الـ Secrets الصحيحة
**الأولوية:** 🔵 Low لكن ضرورية للتشغيل  
**المرجع:** L-4 في تقرير المخاطر  

**المطلوب:**
1. تحديث `replit.md` بأسماء الـ secrets الصحيحة:
   - الكود يتوقع: `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`
   - **ليس**: `SUPABASE_URL` أو `SUPABASE_ANON_KEY`
2. إضافة ملاحظة واضحة في `docs/00_CURRENT_STATE_AUDIT.md` حول هذا الفرق

**معيار القبول:**
- [ ] الـ secrets المُضافة بالأسماء الصحيحة تُفعّل `isSupabaseConfigured = true`
- [ ] تظهر شاشة login حقيقية بدلاً من Demo Mode

---

## ترتيب التنفيذ المقترح

```
الأسبوع الأول:
  T-7 (30 دقيقة)  ← الأسرع، يفتح الباب للاختبار الحقيقي
  T-2 (1 ساعة)    ← قبل أي migration
  T-1 (4 ساعات)   ← الأهم أمنياً، يجب أن يسبق ربط أي وحدة
  T-3 (2 ساعة)    ← توسيع schema clients
  T-4 (1 ساعة)    ← توسيع schema tasks

الأسبوع الثاني:
  T-6 (3 ساعات)   ← أسهل وحدة للربط (نمط مشابه لـ Projects)
  T-5 (4 ساعات)   ← أكثر تعقيداً (wizard + multi-step)
```

---

## ما هو خارج نطاق هذا الـ Sprint

- إنشاء جدول `campaigns` في DB (يستحق Sprint منفصل لتعقيده)
- إنشاء جداول approvals, finance, documents (Sprint 2+)
- إضافة ميزات جديدة
- تغيير تصميم الواجهات
- WhatsApp أو أي APIs خارجية

---

## تعريف "Done" للـ Sprint كاملاً

- [ ] جميع سياسات RLS معدَّلة لعزل البيانات بين المستخدمين (T-1)
- [ ] `profiles.role` يقبل الـ 9 أدوار (T-2)
- [ ] schema clients و tasks محدَّثان في DB و `supabase.ts` (T-3, T-4)
- [ ] Clients و Influencers متصلتان فعلياً بـ Supabase (T-5, T-6)
- [ ] `pnpm run typecheck` يمر بـ 0 أخطاء
- [ ] البيانات تبقى بعد تحديث الصفحة في وحدات Clients و Influencers
- [ ] أسماء الـ Secrets موثقة بشكل صحيح (T-7)
