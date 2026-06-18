import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  Plus, Search, Filter, Pencil, Trash2, X, Building2, Phone, Globe,
  FileText, CheckCircle2, XCircle, User, Eye, Bell, AlertTriangle,
  QrCode, Loader2, Upload, ChevronRight, ChevronLeft, Check, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockEnterpriseClients, mockTeamMembers, getContractStatus,
  type MockEnterpriseClient, type ClientAttachment, type ClientAttachmentType,
  type ClientStatus, type ClientPriority
} from "../lib/enterpriseData";

const ATTACHMENT_TYPES: { value: ClientAttachmentType; label_en: string; label_ar: string }[] = [
  { value: "commercial_registration", label_en: "Commercial Registration", label_ar: "السجل التجاري" },
  { value: "vat_certificate",         label_en: "VAT Certificate",          label_ar: "شهادة ضريبة القيمة المضافة" },
  { value: "national_address_certificate", label_en: "National Address Certificate", label_ar: "شهادة العنوان الوطني" },
  { value: "contract",                label_en: "Contract",                  label_ar: "العقد" },
  { value: "other",                   label_en: "Other",                     label_ar: "أخرى" },
];

const CLIENT_STATUSES: ClientStatus[] = ["prospect", "active", "suspended", "contract_ended"];
const CLIENT_PRIORITIES: ClientPriority[] = ["high", "medium", "low"];

const STEPS = ["basic", "address", "legal", "attachments", "team"] as const;
type Step = typeof STEPS[number];

const STEP_META: Record<Step, { icon: string; title_en: string; title_ar: string }> = {
  basic:       { icon: "1", title_en: "Basic Information",  title_ar: "المعلومات الأساسية" },
  address:     { icon: "2", title_en: "National Address",   title_ar: "العنوان الوطني" },
  legal:       { icon: "3", title_en: "Legal & Contract",   title_ar: "القانوني والعقد" },
  attachments: { icon: "4", title_en: "Attachments",        title_ar: "المرفقات" },
  team:        { icon: "5", title_en: "Team & Notes",       title_ar: "الفريق والملاحظات" },
};

const emptyForm = () => ({
  name: "", brand_name: "", brand_link: "", phone: "", email: "", industry: "",
  status: "prospect" as ClientStatus, priority: null as ClientPriority | null,
  account_manager_id: null as string | null, account_manager: null as string | null,
  responsible_employee_id: null as string | null, responsible_employee: null as string | null,
  legal_company_name: "", commercial_registration_number: "",
  cr_expiry_date: "", company_type: "",
  contract_start_date: null as string | null, contract_end_date: null as string | null,
  country: "المملكة العربية السعودية", city: "", district: "",
  street_name: "", additional_number: "", postal_code: "", building_number: "",
  vat_subject: false, vat_registered_name: "", vat_number: "", vat_expiry_date: "",
  notes: "",
});

const STATUS_STYLES: Record<ClientStatus, string> = {
  prospect:       "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  active:         "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  suspended:      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  contract_ended: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  inactive:       "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
const PRIORITY_STYLES: Record<ClientPriority, string> = {
  high:   "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  medium: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  low:    "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function ContractBadge({ endDate, t }: { endDate: string | null; t: (k: string, o?: Record<string, unknown>) => string }) {
  const cs = getContractStatus(endDate);
  if (!cs.type || cs.type === "ok") return null;
  const cfg = {
    expired:  { cls: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",     Icon: XCircle },
    critical: { cls: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", Icon: AlertTriangle },
    warning:  { cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",  Icon: Bell },
    ok:       { cls: "", Icon: CheckCircle2 },
  };
  const { cls, Icon } = cfg[cs.type];
  const label = cs.type === "expired" ? t("clients.contractExpired") : t("clients.daysLeft", { count: cs.daysLeft });
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

export default function Clients() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [clients, setClients] = useState<MockEnterpriseClient[]>([...mockEnterpriseClients]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<MockEnterpriseClient | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [form, setForm] = useState(emptyForm());
  const [formAttachments, setFormAttachments] = useState<ClientAttachment[]>([]);
  const [campaignTeam, setCampaignTeam] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const remindersCount = clients.filter(c => {
    const cs = getContractStatus(c.contract_end_date);
    return cs.type === "critical" || cs.type === "warning" || cs.type === "expired";
  }).length;

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.brand_name.toLowerCase().includes(q) ||
      c.legal_company_name.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) ||
      c.commercial_registration_number.includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchQ && matchStatus;
  });

  function openAdd() {
    setEditing(null); setForm(emptyForm()); setFormAttachments([]);
    setCampaignTeam([]); setCurrentStep("basic"); setStepErrors({}); setDialogOpen(true);
  }

  function openEdit(client: MockEnterpriseClient) {
    setEditing(client);
    setForm({
      name: client.name, brand_name: client.brand_name, brand_link: client.brand_link,
      phone: client.phone, email: client.email, industry: client.industry,
      status: client.status, priority: client.priority,
      account_manager_id: client.account_manager_id, account_manager: client.account_manager,
      responsible_employee_id: client.responsible_employee_id, responsible_employee: client.responsible_employee,
      legal_company_name: client.legal_company_name, commercial_registration_number: client.commercial_registration_number,
      cr_expiry_date: client.cr_expiry_date, company_type: client.company_type,
      contract_start_date: client.contract_start_date, contract_end_date: client.contract_end_date,
      country: client.country, city: client.city, district: client.district,
      street_name: client.street_name, additional_number: client.additional_number,
      postal_code: client.postal_code, building_number: client.building_number,
      vat_subject: client.vat_subject, vat_registered_name: client.vat_registered_name,
      vat_number: client.vat_number, vat_expiry_date: client.vat_expiry_date,
      notes: client.notes,
    });
    setFormAttachments([...client.attachments]);
    setCampaignTeam([]); setCurrentStep("basic"); setStepErrors({}); setDialogOpen(true);
  }

  function validateStep(step: Step): Record<string, string> {
    const errors: Record<string, string> = {};
    if (step === "basic") {
      if (!form.brand_name.trim()) errors.brand_name = isAr ? "مطلوب" : "Required";
      if (!form.phone.trim()) errors.phone = isAr ? "مطلوب" : "Required";
      if (!form.legal_company_name.trim()) errors.legal_company_name = isAr ? "مطلوب" : "Required";
      if (!form.commercial_registration_number.trim()) errors.commercial_registration_number = isAr ? "مطلوب" : "Required";
    }
    if (step === "address") {
      if (form.building_number && !/^\d{4}$/.test(form.building_number.trim())) {
        errors.building_number = isAr ? "يجب أن يكون رقم المبنى 4 أرقام بالضبط" : "Building number must be exactly 4 digits";
      }
      if (form.postal_code && !/^\d{5}$/.test(form.postal_code.trim())) {
        errors.postal_code = isAr ? "يجب أن يكون الرمز البريدي 5 أرقام بالضبط" : "Postal code must be exactly 5 digits";
      }
    }
    return errors;
  }

  function handleNext() {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) { setStepErrors(errors); return; }
    setStepErrors({});
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]);
  }

  function handlePrev() {
    setStepErrors({});
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]);
  }

  function simulateScan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setForm(f => ({
        ...f,
        legal_company_name: f.legal_company_name || (isAr ? "شركة نموذجية للتسويق" : "Sample Marketing Co."),
        commercial_registration_number: f.commercial_registration_number || "1010" + Math.floor(100000 + Math.random() * 900000),
        city: f.city || (isAr ? "الرياض" : "Riyadh"),
        district: f.district || (isAr ? "حي العليا" : "Al Olaya"),
        postal_code: f.postal_code || "11481",
        building_number: f.building_number || "7823",
      }));
    }, 2000);
  }

  function addAttachment() {
    setFormAttachments(prev => [...prev, {
      id: `at-${Date.now()}`, name: "", attachment_type: "other",
      file_type: "pdf", file_size: "—", uploaded_by: isAr ? "المستخدم الحالي" : "Current User",
      uploaded_at: new Date().toISOString(),
    }]);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const teamNames = campaignTeam.map(id => mockTeamMembers.find(m => m.id === id)?.name || "").filter(Boolean);
      if (editing) {
        setClients(cs => cs.map(c => c.id === editing.id ? {
          ...c, ...form, attachments: formAttachments, updated_at: now,
          responsible_employee: teamNames.join(", ") || form.responsible_employee,
          activity_log: [{ id: `al-${Date.now()}`, action_en: "Client updated", action_ar: "تم تحديث بيانات العميل", user: isAr ? "المستخدم الحالي" : "Current User", timestamp: now, details: null }, ...c.activity_log],
        } : c));
      } else {
        setClients(cs => [{
          id: `ec-${Date.now()}`, ...form, attachments: formAttachments,
          responsible_employee: teamNames.join(", ") || null,
          activity_log: [{ id: `al-${Date.now()}`, action_en: "Client created", action_ar: "تم إنشاء العميل", user: isAr ? "المستخدم الحالي" : "Current User", timestamp: now, details: null }],
          created_at: now, updated_at: now,
        }, ...cs]);
      }
      setSaving(false); setDialogOpen(false);
    }, 600);
  }

  const stepIdx = STEPS.indexOf(currentStep);
  const isLastStep = stepIdx === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("clients.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {remindersCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-medium">
              <Bell className="w-3.5 h-3.5" />{remindersCount} {t("clients.contractReminders")}
            </div>
          )}
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />{t("clients.addClient")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("clients.search")}
            className="w-full h-10 ps-9 pe-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="all">{t("common.all")}</option>
            {CLIENT_STATUSES.map(s => <option key={s} value={s}>{t(`clients.statuses.${s}`)}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("clients.brandLabel")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">{t("clients.legalName")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">{t("clients.crNumber")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">{t("clients.vatStatus")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden xl:table-cell">{t("clients.contractEnd")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("common.status")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-muted-foreground text-sm">{search ? t("common.noData") : t("clients.noClients")}</td></tr>
              ) : filtered.map(client => {
                const cs = getContractStatus(client.contract_end_date);
                return (
                  <tr key={client.id} className={cn("hover:bg-muted/30 transition-colors",
                    (cs.type === "critical" || cs.type === "expired") && "bg-red-50/30 dark:bg-red-950/10")}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{client.brand_name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground truncate">{client.brand_name}</p>
                            {client.priority && (
                              <span className={cn("hidden sm:inline-flex px-1.5 py-0.5 rounded text-xs font-medium", PRIORITY_STYLES[client.priority])}>
                                {t(`clients.priorities.${client.priority}`)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                      <span className="truncate max-w-[160px] block">{client.legal_company_name || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{client.commercial_registration_number || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {client.vat_subject ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />{t("clients.vatSubjectShort")}</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="w-3.5 h-3.5" />{t("clients.vatExempt")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell"><ContractBadge endDate={client.contract_end_date} t={t} /></td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_STYLES[client.status])}>{t(`clients.statuses.${client.status}`)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/clients/${client.id}`} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
          <div className="fixed inset-0 bg-black/60" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10 flex-shrink-0">
              <div>
                <h2 className="font-bold text-base">{editing ? t("clients.editClient") : t("clients.addClient")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? STEP_META[currentStep].title_ar : STEP_META[currentStep].title_en}
                  {" · "}{isAr ? `الخطوة ${stepIdx + 1} من ${STEPS.length}` : `Step ${stepIdx + 1} of ${STEPS.length}`}
                </p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="px-5 pt-4 flex-shrink-0">
              <div className="flex items-center gap-0 mb-4">
                {STEPS.map((step, idx) => {
                  const done = idx < stepIdx;
                  const active = idx === stepIdx;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
                        done ? "bg-primary text-white" : active ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted text-muted-foreground")}>
                        {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={cn("flex-1 h-0.5 mx-1 transition-colors", done ? "bg-primary" : "bg-muted")} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-5 pb-2">
              {Object.keys(stepErrors).length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 space-y-1">
                  {Object.values(stepErrors).map((e, i) => <div key={i}>• {e}</div>)}
                </div>
              )}

              {currentStep === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FF label={`${t("clients.brandName")} *`} error={stepErrors.brand_name}>
                      <input value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} className={cn(ic, stepErrors.brand_name && errCls)} />
                    </FF>
                    <FF label={t("clients.clientName")}>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={ic} />
                    </FF>
                  </div>
                  <FF label={`${t("clients.phone")} *`} error={stepErrors.phone}>
                    <div className="relative">
                      <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className={cn(ic, "ps-9", stepErrors.phone && errCls)} dir="ltr" placeholder="+966 5X XXX XXXX" />
                    </div>
                  </FF>
                  <div className="grid grid-cols-2 gap-4">
                    <FF label={`${t("clients.legalCompanyName")} *`} error={stepErrors.legal_company_name}>
                      <input value={form.legal_company_name} onChange={e => setForm(f => ({ ...f, legal_company_name: e.target.value }))} className={cn(ic, stepErrors.legal_company_name && errCls)} />
                    </FF>
                    <FF label={`${t("clients.commercialRegistrationNumber")} *`} error={stepErrors.commercial_registration_number}>
                      <input value={form.commercial_registration_number} onChange={e => setForm(f => ({ ...f, commercial_registration_number: e.target.value }))} className={cn(ic, stepErrors.commercial_registration_number && errCls)} dir="ltr" />
                    </FF>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FF label={t("clients.brandLink")}>
                      <div className="relative">
                        <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.brand_link} onChange={e => setForm(f => ({ ...f, brand_link: e.target.value }))}
                          className={cn(ic, "ps-9")} dir="ltr" placeholder="https://" />
                      </div>
                    </FF>
                    <FF label={t("clients.email")}>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={ic} dir="ltr" />
                    </FF>
                  </div>
                  <FF label={t("clients.industry")}>
                    <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className={ic}
                      placeholder={isAr ? "مثال: تجزئة، أغذية، تقنية..." : "e.g. Retail, Food & Beverage, Tech..."} />
                  </FF>
                  <div className="grid grid-cols-2 gap-4">
                    <FF label={t("clients.status")}>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClientStatus }))} className={ic}>
                        {CLIENT_STATUSES.map(s => <option key={s} value={s}>{t(`clients.statuses.${s}`)}</option>)}
                      </select>
                    </FF>
                    <FF label={t("clients.priority")}>
                      <select value={form.priority || ""} onChange={e => setForm(f => ({ ...f, priority: (e.target.value as ClientPriority) || null }))} className={ic}>
                        <option value="">{t("common.select")} ({t("common.optional")})</option>
                        {CLIENT_PRIORITIES.map(p => <option key={p} value={p}>{t(`clients.priorities.${p}`)}</option>)}
                      </select>
                    </FF>
                  </div>
                </div>
              )}

              {currentStep === "address" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
                    {isAr
                      ? "تأكد من إدخال رقم المبنى بـ 4 أرقام والرمز البريدي بـ 5 أرقام وفق متطلبات العنوان الوطني السعودي"
                      : "Building number must be exactly 4 digits and postal code exactly 5 digits per Saudi National Address requirements"}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FF label={t("clients.country")}>
                      <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className={ic} />
                    </FF>
                    <FF label={t("clients.city")}>
                      <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={ic} />
                    </FF>
                    <FF label={t("clients.district")}>
                      <input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className={ic} />
                    </FF>
                    <FF label={t("clients.streetName")}>
                      <input value={form.street_name} onChange={e => setForm(f => ({ ...f, street_name: e.target.value }))} className={ic} />
                    </FF>
                    <FF label={t("clients.buildingNumber")} error={stepErrors.building_number}
                      hint={isAr ? "4 أرقام بالضبط" : "Exactly 4 digits"}>
                      <input value={form.building_number} maxLength={4}
                        onChange={e => setForm(f => ({ ...f, building_number: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        className={cn(ic, stepErrors.building_number && errCls)} dir="ltr" placeholder="1234" />
                    </FF>
                    <FF label={t("clients.additionalNumber")}>
                      <input value={form.additional_number} onChange={e => setForm(f => ({ ...f, additional_number: e.target.value }))} className={ic} dir="ltr" />
                    </FF>
                    <FF label={t("clients.postalCode")} error={stepErrors.postal_code}
                      hint={isAr ? "5 أرقام بالضبط" : "Exactly 5 digits"}>
                      <input value={form.postal_code} maxLength={5}
                        onChange={e => setForm(f => ({ ...f, postal_code: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                        className={cn(ic, stepErrors.postal_code && errCls)} dir="ltr" placeholder="12345" />
                    </FF>
                  </div>
                </div>
              )}

              {currentStep === "legal" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{isAr ? "يمكنك مسح QR / باركود لملء البيانات تلقائياً" : "Scan QR / barcode to auto-fill legal data"}</p>
                    <button onClick={simulateScan} disabled={scanning}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60">
                      {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                      {scanning ? t("clients.scanning") : t("clients.scanQR")}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FF label={t("clients.companyType")}>
                      <select value={form.company_type} onChange={e => setForm(f => ({ ...f, company_type: e.target.value }))} className={ic}>
                        <option value="">{t("common.select")}</option>
                        {["شركة ذات مسؤولية محدودة", "مؤسسة فردية", "شركة مساهمة", "شركة تضامن", "Other"].map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </FF>
                    <FF label={t("clients.crExpiryDate")}>
                      <input type="date" value={form.cr_expiry_date} onChange={e => setForm(f => ({ ...f, cr_expiry_date: e.target.value }))} className={ic} dir="ltr" />
                    </FF>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FF label={t("clients.contractStartDate")}>
                      <input type="date" value={form.contract_start_date || ""} onChange={e => setForm(f => ({ ...f, contract_start_date: e.target.value || null }))} className={ic} dir="ltr" />
                    </FF>
                    <FF label={t("clients.contractEndDate")}>
                      <input type="date" value={form.contract_end_date || ""} onChange={e => setForm(f => ({ ...f, contract_end_date: e.target.value || null }))} className={ic} dir="ltr" />
                    </FF>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{t("clients.vatSubject")}</span>
                      <button onClick={() => setForm(f => ({ ...f, vat_subject: !f.vat_subject }))}
                        className={cn("relative w-11 h-6 rounded-full transition-colors", form.vat_subject ? "bg-primary" : "bg-muted-foreground/30")}>
                        <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                          form.vat_subject ? "start-6" : "start-1")} />
                      </button>
                    </div>
                    {form.vat_subject && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <div className="grid grid-cols-2 gap-3">
                          <FF label={t("clients.vatRegisteredName")}>
                            <input value={form.vat_registered_name} onChange={e => setForm(f => ({ ...f, vat_registered_name: e.target.value }))} className={ic} />
                          </FF>
                          <FF label={t("clients.vatNumber")}>
                            <input value={form.vat_number} onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))} className={ic} dir="ltr" />
                          </FF>
                        </div>
                        <FF label={t("clients.vatExpiryDate")}>
                          <input type="date" value={form.vat_expiry_date} onChange={e => setForm(f => ({ ...f, vat_expiry_date: e.target.value }))} className={ic} dir="ltr" />
                        </FF>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === "attachments" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{t("clients.attachmentsSection")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isAr ? "ارفع المستندات المطلوبة أو امسح الباركود لاستخراج البيانات" : "Upload required documents or scan a barcode to extract data"}
                      </p>
                    </div>
                    <button onClick={simulateScan} disabled={scanning}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60">
                      {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                      {scanning ? (isAr ? "جاري المسح..." : "Scanning...") : t("clients.scanQR")}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ATTACHMENT_TYPES.map(at => (
                      <button key={at.value} onClick={() => {
                        setFormAttachments(prev => [...prev, {
                          id: `at-${Date.now()}-${at.value}`, name: isAr ? at.label_ar : at.label_en,
                          attachment_type: at.value, file_type: "pdf", file_size: "—",
                          uploaded_by: isAr ? "المستخدم الحالي" : "Current User", uploaded_at: new Date().toISOString(),
                        }]);
                      }}
                        className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-xs text-start">
                        <Upload className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{isAr ? at.label_ar : at.label_en}</span>
                      </button>
                    ))}
                  </div>

                  {formAttachments.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">{isAr ? "المرفقات المضافة:" : "Added attachments:"}</p>
                      {formAttachments.map(att => (
                        <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <input value={att.name}
                              onChange={e => setFormAttachments(prev => prev.map(a => a.id === att.id ? { ...a, name: e.target.value } : a))}
                              className="w-full bg-transparent text-sm font-medium focus:outline-none"
                              placeholder={isAr ? "اسم الملف..." : "File name..."} />
                            <select value={att.attachment_type}
                              onChange={e => setFormAttachments(prev => prev.map(a => a.id === att.id ? { ...a, attachment_type: e.target.value as ClientAttachmentType } : a))}
                              className="text-xs text-muted-foreground bg-transparent focus:outline-none mt-0.5">
                              {ATTACHMENT_TYPES.map(at => <option key={at.value} value={at.value}>{isAr ? at.label_ar : at.label_en}</option>)}
                            </select>
                          </div>
                          <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded uppercase">{att.file_type}</span>
                          <button onClick={() => setFormAttachments(prev => prev.filter(a => a.id !== att.id))}
                            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 dark:hover:bg-red-950/30 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
                      <FileText className="w-7 h-7 mx-auto mb-2 opacity-30" />
                      {isAr ? "لم تُضف أي مرفقات بعد — اضغط على أي نوع أعلاه لإضافته" : "No attachments yet — click any type above to add it"}
                    </div>
                  )}
                </div>
              )}

              {currentStep === "team" && (
                <div className="space-y-4">
                  <FF label={t("clients.accountManager")}>
                    <div className="relative">
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select value={form.account_manager_id || ""}
                        onChange={e => {
                          const emp = e.target.value ? mockTeamMembers.find(m => m.id === e.target.value) : null;
                          setForm(f => ({ ...f, account_manager_id: e.target.value || null, account_manager: emp?.name || null }));
                        }}
                        className={cn(ic, "ps-9")}>
                        <option value="">{t("clients.selectEmployee")}</option>
                        {mockTeamMembers.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — {t(`roles.${emp.role}`)}</option>)}
                      </select>
                    </div>
                  </FF>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{isAr ? "فريق الحملة (متعدد)" : "Campaign Team (multi-select)"}</span>
                    </label>
                    <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                      {mockTeamMembers.map(emp => {
                        const selected = campaignTeam.includes(emp.id);
                        return (
                          <div key={emp.id} onClick={() => setCampaignTeam(prev => selected ? prev.filter(id => id !== emp.id) : [...prev, emp.id])}
                            className={cn("flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                              selected ? "bg-primary/5 border-s-2 border-primary" : "hover:bg-muted/40")}>
                            <div className={cn("w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                              selected ? "bg-primary border-primary" : "border-border")}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">{emp.name.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{t(`roles.${emp.role}`)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {campaignTeam.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {campaignTeam.map(id => {
                          const emp = mockTeamMembers.find(m => m.id === id);
                          return emp ? (
                            <span key={id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {emp.name}
                              <button onClick={() => setCampaignTeam(prev => prev.filter(x => x !== id))} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <FF label={t("common.notes")}>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={4} className={cn(ic, "h-auto py-2 resize-none")}
                      placeholder={isAr ? "ملاحظات إضافية عن العميل..." : "Additional notes about this client..."} />
                  </FF>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex items-center justify-between flex-shrink-0">
              <button onClick={stepIdx === 0 ? () => setDialogOpen(false) : handlePrev}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                {stepIdx === 0 ? (
                  <><X className="w-4 h-4" />{t("common.cancel")}</>
                ) : (
                  <><ChevronLeft className="w-4 h-4 rtl:rotate-180" />{t("common.previous")}</>
                )}
              </button>
              {isLastStep ? (
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{isAr ? "جاري الحفظ..." : "Saving..."}</> : <><Check className="w-4 h-4" />{isAr ? "حفظ العميل" : "Save Client"}</>}
                </button>
              ) : (
                <button onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {t("common.next")}<ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-semibold mb-2">{t("common.confirmDeleteTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-5">{t("clients.confirmDelete")}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">{t("common.cancel")}</button>
              <button onClick={() => { setClients(cs => cs.filter(c => c.id !== deleteId)); setDeleteId(null); }}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ic = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
const errCls = "border-red-400 focus:ring-red-200 focus:border-red-500";
function FF({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-muted-foreground">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
    </div>
  );
}
