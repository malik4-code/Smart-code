# 00 — Current State Audit
**تاريخ التدقيق:** 2026-07-16  
**المشروع:** Smart Code CRM — Marketing Company Management System  
**الوضع العام:** وضع تجريبي (Demo Mode) بالكامل — لا يوجد اتصال فعلي بقاعدة البيانات

---

## 1. التقنية المستخدمة (Tech Stack)

| الطبقة | التقنية | الإصدار |
|--------|---------|---------|
| Runtime | Node.js | 24 |
| اللغة | TypeScript | 5.9 |
| إدارة الحزم | pnpm workspaces | monorepo |
| Frontend Framework | React | catalog (18+) |
| Build Tool | Vite | catalog (7+) |
| CSS | Tailwind CSS v4 | catalog |
| UI Components | shadcn/ui + Radix UI | multiple |
| Routing | wouter | ^3.3.5 |
| State/Cache | @tanstack/react-query | catalog |
| i18n | react-i18next + i18next | ^26.3.1 / ^17.0.8 |
| Auth + Database | Supabase JS | ^2.108.2 |
| Charts | recharts | ^2.15.2 |
| Icons | lucide-react + react-icons | catalog / ^5.4.0 |
| Animations | framer-motion | catalog |
| Forms | react-hook-form + zod | ^7.55.0 / catalog |

---

## 2. بنية المجلدات

```
workspace/
├── artifacts/
│   ├── crm/                        ← التطبيق الرئيسي (الواجهة)
│   │   └── src/
│   │       ├── App.tsx             ← Router + Providers
│   │       ├── main.tsx
│   │       ├── index.css
│   │       ├── components/
│   │       │   ├── Layout.tsx      ← Sidebar + Header
│   │       │   └── ui/             ← 45 shadcn/ui component
│   │       ├── contexts/
│   │       │   ├── AuthContext.tsx
│   │       │   ├── LanguageContext.tsx
│   │       │   └── ViewAsContext.tsx
│   │       ├── hooks/
│   │       │   ├── use-mobile.tsx
│   │       │   └── use-toast.ts
│   │       ├── i18n/
│   │       │   ├── index.ts
│   │       │   └── locales/
│   │       │       ├── en.json     ← ~325 سطر
│   │       │       └── ar.json     ← ~325 سطر
│   │       ├── lib/
│   │       │   ├── supabase.ts     ← Client + TypeScript interfaces
│   │       │   ├── mockData.ts     ← بيانات تجريبية بسيطة (60 سطر)
│   │       │   ├── enterpriseData.ts ← بيانات تجريبية معقدة (624 سطر)
│   │       │   └── utils.ts
│   │       ├── pages/              ← 17 صفحة
│   │       └── types/index.ts
│   ├── api-server/                 ← API Server (غير مستخدم من CRM حالياً)
│   └── mockup-sandbox/             ← Canvas component preview
├── supabase-schema.sql             ← Schema أولي (6 جداول)
├── replit.md
└── docs/                           ← ← هذه الملفات
```

---

## 3. الصفحات الموجودة (17 صفحة)

| الصفحة | المسار | الحجم (سطر) | تصنيف البيانات | اكتمال الوحدة |
|--------|--------|-------------|----------------|---------------|
| Login | `/login` | 110 | SUPABASE_CONNECTED | مكتملة ✅ |
| Dashboard | `/` | 284 | HYBRID | مكتملة جزئياً ⚠️ |
| Clients | `/clients` | 754 | DEMO_ONLY | شكلية 🔶 |
| ClientDetail | `/clients/:id` | 693 | DEMO_ONLY | شكلية 🔶 |
| Campaigns | `/campaigns` | 612 | DEMO_ONLY | شكلية 🔶 |
| CampaignDetail | `/campaigns/:id` | 600 | DEMO_ONLY | شكلية 🔶 |
| Influencers | `/influencers` | 644 | DEMO_ONLY | شكلية 🔶 |
| Projects | `/projects` | 274 | HYBRID | مكتملة جزئياً ⚠️ |
| Tasks | `/tasks` | 541 | HYBRID | مكتملة جزئياً ⚠️ |
| Approvals | `/approvals` | 201 | DEMO_ONLY | شكلية 🔶 |
| Finance | `/finance` | 183 | DEMO_ONLY | شكلية 🔶 |
| Documents | `/documents` | 181 | DEMO_ONLY | شكلية 🔶 |
| Calendar | `/calendar` | 327 | DEMO_ONLY | شكلية 🔶 |
| Reports | `/reports` | 220 | HYBRID | مكتملة جزئياً ⚠️ |
| ActivityLog | `/activity` | 197 | DEMO_ONLY | شكلية 🔶 |
| UsersRoles | `/users-roles` | 322 | DEMO_ONLY | شكلية 🔶 |
| NotFound | `*` | 22 | — | مكتملة ✅ |

**الإجمالي:** 17 صفحة — 1 متصلة فعلياً بـ Supabase، 4 هجينة (Hybrid)، 12 تجريبية بالكامل.

---

## 4. تصنيف الوحدات

### ✅ وحدات مكتملة (متصلة بـ Supabase أو تعمل بشكل صحيح)
- **Login/Auth** — تسجيل دخول حقيقي عبر Supabase email/password

### ⚠️ وحدات هجينة (HYBRID) — تعمل مع Supabase عند تهيئته، بيانات وهمية بدونه
- **Dashboard** — يجلب clients/tasks/projects من Supabase، يعرض campaigns/approvals/finance من Mock
- **Projects** — CRUD حقيقي لجدول `projects`
- **Tasks** — CRUD حقيقي لجدول `tasks`، لكنّ campaign/team/task_type حقول إضافية غير موجودة في DB
- **Reports** — يقرأ من Supabase (projects/tasks/influencers/clients)، لكن Influencers غير متصل بـ Supabase

### 🔶 وحدات شكلية (DEMO_ONLY) — لا تكتب أي شيء في قاعدة البيانات
- **Clients** — يستخدم `mockEnterpriseClients` (نموذج موسّع لا يطابق جدول DB)
- **ClientDetail** — قراءة من mockEnterpriseClients + mockCampaigns + mockDocuments
- **Campaigns** — يستخدم `mockCampaigns` (نوع `MockCampaign`، لا جدول DB مقابل له)
- **CampaignDetail** — قراءة من `mockCampaigns`؛ Workspace state محلي فقط
- **Influencers** — يستخدم `mockInfluencers` من mockData.ts (لا Supabase)
- **Approvals** — `mockApprovals` فقط، أزرار الموافقة لا تحفظ شيئاً
- **Finance** — `mockFinanceRecords` فقط، لا جدول DB
- **Documents** — `mockDocuments` فقط، لا رفع حقيقي
- **Calendar** — `mockCampaigns` + `mockEnterpriseClients`
- **ActivityLog** — `mockActivities` فقط، لا تسجيل حقيقي
- **UsersRoles** — `mockTeamMembers` فقط، ViewAs مجرد UI cosmetic

---

## 5. نتائج الفحص التقني

### pnpm run typecheck
```
✅ PASS — 0 أخطاء
artifacts/crm        → Done in 5.7s
artifacts/api-server → Done in 1.8s
artifacts/mockup-sandbox → Done in 4.4s
scripts → Done in 965ms
```

### pnpm --filter @workspace/crm run build
```
❌ FAIL
Error: PORT environment variable is required but was not provided.
  at vite.config.ts:10

السبب: vite.config.ts يشترط متغير PORT الذي يُضاف فقط عبر workflow الـ Replit.
يعمل في التطوير (dev workflow) لكنه يفشل عند تشغيل build مباشرة من CLI.
هذا قيد بيئة Replit، ليس خطأ في الكود.
```

---

## 6. ملاحظات مهمة

- **وضع Demo:** عندما تكون `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` غير مُعيّنتين، يُسجّل النظام تلقائياً دخول مستخدم وهمي بصلاحيات `admin` كاملة بدون أي مصادقة.
- **enterpriseData.ts (624 سطر)** هي المصدر الوحيد لبيانات الوحدات الأكثر تعقيداً (Campaigns, Clients, Finance, Approvals) — لا تُحفظ أي تعديلات عليها بين الجلسات.
- **الـ i18n** مكتمل بالكامل — عربي وإنجليزي بـ RTL/LTR صحيح.
- **تعارض الأنواع:** `MockCampaign`, `MockEnterpriseClient`, `MockTeamMember` هي أنواع خاصة بالـ Enterprise لا تطابق interfaces الـ Supabase الأساسية.
