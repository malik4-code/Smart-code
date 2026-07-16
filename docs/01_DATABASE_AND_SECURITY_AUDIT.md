# 01 — Database & Security Audit
**تاريخ التدقيق:** 2026-07-16  
**الملف المرجعي:** `supabase-schema.sql`

---

## 1. الجداول الموجودة في قاعدة البيانات

| الجدول | الغرض | عدد الأعمدة | RLS مُفعّل؟ |
|--------|--------|-------------|------------|
| `public.profiles` | بيانات المستخدمين | 6 | ✅ نعم |
| `public.clients` | العملاء | 11 | ✅ نعم |
| `public.influencers` | المؤثرون | 11 | ✅ نعم |
| `public.projects` | المشاريع | 9 | ✅ نعم |
| `public.project_influencers` | علاقة مشروع-مؤثر (Junction) | 3 | ✅ نعم |
| `public.tasks` | المهام | 9 | ✅ نعم |

---

## 2. تفاصيل الأعمدة والعلاقات

### `public.profiles`
```sql
id          uuid (FK → auth.users, PK)
email       text NOT NULL
full_name   text
role        text CHECK IN ('admin', 'manager', 'employee')  ← 3 قيم فقط
avatar_url  text
created_at  timestamptz
```
**العلاقات:** ← يُستخدَم كـ FK في `tasks.assignee_id`

### `public.clients`
```sql
id              uuid PK
name            text NOT NULL
industry        text
email           text
phone           text
address         text
website         text
contact_person  text
status          text CHECK IN ('active', 'inactive')  ← 2 قيمة فقط
notes           text
created_at / updated_at  timestamptz
```

### `public.influencers`
```sql
id               uuid PK
name             text NOT NULL
platform         text NOT NULL
category         text
city             text
followers        integer
engagement_rate  decimal(5,2)
estimated_price  decimal(12,2)
email / phone    text
notes            text
created_at / updated_at  timestamptz
```

### `public.projects`
```sql
id          uuid PK
name        text NOT NULL
client_id   uuid FK → clients (ON DELETE SET NULL)
description text
budget      decimal(12,2)
status      text CHECK IN ('planning','active','on_hold','completed','cancelled')
start_date / end_date  date
created_at / updated_at  timestamptz
```

### `public.tasks`
```sql
id           uuid PK
title        text NOT NULL
description  text
project_id   uuid FK → projects (ON DELETE SET NULL)
assignee_id  uuid FK → profiles (ON DELETE SET NULL)
status       text CHECK IN ('pending','in_progress','completed','cancelled')
priority     text CHECK IN ('low','medium','high','urgent')
due_date     date
created_at / updated_at  timestamptz
```

### `public.project_influencers` (Junction)
```sql
id             uuid PK
project_id     uuid FK → projects (ON DELETE CASCADE)
influencer_id  uuid FK → influencers (ON DELETE CASCADE)
UNIQUE(project_id, influencer_id)
```

---

## 3. الجداول والحقول الناقصة (مقارنة بالواجهة)

### جداول كاملة مفقودة من Schema
| الجدول المفقود | تستخدمه هذه الوحدات |
|----------------|---------------------|
| `campaigns` | Campaigns, CampaignDetail, Dashboard, Calendar, Tasks |
| `campaign_stages` | CampaignDetail (15 مرحلة workflow) |
| `campaign_influencers` | CampaignDetail, Campaigns |
| `approvals` | Approvals |
| `approval_levels` | Approvals (multi-level chain) |
| `finance_records` | Finance, Dashboard |
| `documents` | Documents, ClientDetail |
| `activity_log` | ActivityLog |
| `notifications` | Layout (bell icon) |

### حقول ناقصة في الجداول الموجودة

**جدول `clients` — الواجهة تستخدم:**
```
brand_name, legal_company_name, cr_number, cr_expiry_date,
vat_subject (boolean), vat_number, vat_expiry_date,
company_type, contract_start_date, contract_end_date,
has_contract, contract_notes, priority,
responsible_employee_id, campaign_team (array),
attachments (jsonb array)
```
→ **20+ حقل في الواجهة غير موجود في DB**

**جدول `tasks` — الواجهة تستخدم:**
```
campaign_id, campaign_name (denormalized), client_name (denormalized),
assigned_by, campaign_leader, department, task_type, time_logs (jsonb)
```
→ **8 حقل إضافي غير موجود في DB**

**جدول `profiles` — الواجهة تستخدم:**
```
9 أدوار: admin, manager, dept_manager, team_leader, employee,
         influencer_specialist, account_manager, finance_user, client_user
```
→ **DB يسمح بـ 3 قيم فقط: admin, manager, employee — سيُرفض أي role آخر**

**جدول `influencers` — الواجهة تستخدم:**
```
username, country, gender, language, avg_views,
discount_price, is_favorite, is_blacklisted
```
→ **8 حقل إضافي غير موجود في DB**

---

## 4. سياسات Row Level Security (RLS)

```sql
-- profiles
"Profiles: authenticated can view all" → SELECT: auth.role() = 'authenticated'
"Profiles: users update own"           → UPDATE:  auth.uid() = id

-- clients
"Clients: authenticated CRUD"          → ALL:    auth.role() = 'authenticated'

-- influencers
"Influencers: authenticated CRUD"      → ALL:    auth.role() = 'authenticated'

-- projects
"Projects: authenticated CRUD"         → ALL:    auth.role() = 'authenticated'

-- project_influencers
"ProjectInfluencers: authenticated CRUD" → ALL:  auth.role() = 'authenticated'

-- tasks
"Tasks: authenticated CRUD"            → ALL:    auth.role() = 'authenticated'
```

---

## 5. تحليل الأمان

### 🔴 Critical — مشاكل خطيرة

**C-1: لا يوجد عزل بيانات بين المستخدمين**  
جميع سياسات RLS تستخدم `auth.role() = 'authenticated'` فقط.  
أي مستخدم مُسجَّل يستطيع:
- قراءة **جميع** بيانات العملاء والمؤثرين والمشاريع والمهام
- تعديل أو حذف سجلات لا تخصه
- الوصول إلى بيانات clients الأخرى في نفس النظام

لا يوجد `organization_id` أو `owner_id` على أي سجل لتحديد مالكه.

**C-2: وضع Demo يتجاوز المصادقة كلياً**  
```typescript
// AuthContext.tsx line 23-27
if (!isSupabaseConfigured) {
  setUser({ id: "demo-user", email: mockProfile.email } as User);
  setProfile(mockProfile);  // role: "admin" دائماً
  setLoading(false);
  return;
}
```
أي شخص يفتح التطبيق بدون إعداد Supabase يدخل مباشرة كـ `admin` بدون كلمة مرور.

---

### 🟠 High — مشاكل عالية الخطورة

**H-1: لا يوجد تحقق من الدور على مستوى Supabase**  
الـ `role` في `profiles` يُحدد في واجهة المستخدم فقط (`ViewAsContext`).  
لا توجد سياسات RLS تمنع `employee` من حذف سجل لا يملكه.

**H-2: ViewAs — تجاوز صلاحيات UI بدون تأثير على DB**  
```typescript
// ViewAsContext.tsx — يغير الـ state فقط
startViewAs: (m) => setViewAs({ member: m, startedAt: new Date().toISOString() }),
```
عندما يُنشّط مدير "عرض كـ موظف"، لا تزال طلبات Supabase تُرسَل بـ JWT المدير الأصلي.  
المسؤول (admin) يظل يقرأ/يكتب بصلاحيات admin الكاملة رغم "المحاكاة".

**H-3: لا توجد سياسة INSERT تتحقق من ownership**  
عند إنشاء مهمة/مشروع جديد، لا يُسجَّل `created_by` — لا يمكن معرفة من أنشأ السجل لاحقاً.

---

### 🟡 Medium — مشاكل متوسطة

**M-1: لا توجد سياسات DELETE منفصلة**  
سياسة `ALL` تشمل DELETE دون تقييد — أي مستخدم يمكنه حذف أي سجل.

**M-2: حقل `role` في profiles بدون validation كافٍ**  
`CHECK (role IN ('admin', 'manager', 'employee'))` يرفض الـ 6 أدوار الإضافية التي تعرضها الواجهة.

**M-3: `profiles` مكشوف للجميع**  
أي مستخدم مصادق يرى بيانات جميع المستخدمين (email, role, full_name).

**M-4: لا يوجد Rate Limiting على Auth**  
لا يوجد إعداد لتحديد عدد محاولات تسجيل الدخول.

---

### 🔵 Low — مشاكل منخفضة

**L-1: مفاتيح Supabase في `import.meta.env`**  
`VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` يُبنيان داخل JavaScript bundle — هذا سلوك متوقع لـ Anon Key (مصمم للاستخدام العام) لكن يجب التأكد أن Service Role Key لا يُستخدم في الـ frontend أبداً.  
✅ لا يوجد Service Role Key في أي ملف frontend.

**L-2: `supabase` يُصدَّر كـ `null as unknown`**  
```typescript
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);
```
إذا استُدعي `supabase.from(...)` بدون فحص `isSupabaseConfigured`، سيحدث crash في runtime. الحماية تعتمد على انضباط المطور في كل صفحة.

**L-3: لا توجد سياسات للجداول المستقبلية**  
جداول campaigns/finance/documents التي ستُضاف لاحقاً تحتاج RLS من اليوم الأول.
