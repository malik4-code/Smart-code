import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import {
  Plus, Search, Filter, Pencil, Trash2, X, Building2, Phone, Globe,
  FileText, CheckCircle2, XCircle, User, ChevronRight, QrCode, Loader2,
  Upload, Bell, Calendar, AlertTriangle, Eye, ShieldAlert, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockEnterpriseClients, mockTeamMembers, getContractStatus,
  type MockEnterpriseClient, type ClientAttachment, type ClientAttachmentType,
  type ClientStatus, type ClientPriority
} from "../lib/enterpriseData";

const ATTACHMENT_TYPES: ClientAttachmentType[] = [
  "commercial_registration", "vat_certificate",
  "national_address_certificate", "contract", "other"
];

const CLIENT_STATUSES: ClientStatus[] = ["prospect", "active", "suspended", "contract_ended"];
const CLIENT_PRIORITIES: ClientPriority[] = ["high", "medium", "low"];

const TABS = ["basicInfo", "legalInfo", "nationalAddress", "vatInfo", "attachmentsSection", "employeeSection"] as const;
type Tab = typeof TABS[number];

const emptyForm = (): Omit<MockEnterpriseClient, "id" | "attachments" | "activity_log" | "created_at" | "updated_at"> => ({
  name: "", brand_name: "", brand_link: "", phone: "", email: "", industry: "",
  status: "prospect", priority: null,
  account_manager_id: null, account_manager: null,
  responsible_employee_id: null, responsible_employee: null,
  legal_company_name: "", commercial_registration_number: "",
  cr_expiry_date: "", company_type: "",
  contract_start_date: null, contract_end_date: null,
  country: "المملكة العربية السعودية", city: "", district: "",
  street_name: "", additional_number: "", postal_code: "", building_number: "",
  vat_subject: false, vat_registered_name: "", vat_number: "", vat_expiry_date: "",
  notes: "",
});

function ContractBadge({ endDate, t }: { endDate: string | null; t: (k: string, o?: object) => string }) {
  const cs = getContractStatus(endDate);
  if (!cs.type) return null;
  const cfg = {
    expired:  { cls: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",  Icon: XCircle,       label: t("clients.contractExpired") },
    critical: { cls: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", Icon: AlertTriangle, label: t("clients.daysLeft", { count: cs.daysLeft }) },
    warning:  { cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",  Icon: Bell,          label: t("clients.daysLeft", { count: cs.daysLeft }) },
    ok:       { cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300", Icon: CheckCircle2,  label: t("clients.contractActive") },
  };
  const { cls, Icon, label } = cfg[cs.type];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

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

export default function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<MockEnterpriseClient[]>([...mockEnterpriseClients]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<MockEnterpriseClient | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("basicInfo");
  const [form, setForm] = useState(emptyForm());
  const [formAttachments, setFormAttachments] = useState<ClientAttachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const remindersCount = clients.filter(c => {
    const cs = getContractStatus(c.contract_end_date);
    return cs.type === "critical" || cs.type === "warning" || cs.type === "expired";
  }).length;

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.brand_name.toLowerCase().includes(q) ||
      c.legal_company_name.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.commercial_registration_number.includes(q) ||
      (c.responsible_employee || "").toLowerCase().includes(q) ||
      (c.account_manager || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchQ && matchStatus;
  });

  function openAdd() {
    setEditing(null); setForm(emptyForm()); setFormAttachments([]);
    setActiveTab("basicInfo"); setError(""); setDialogOpen(true);
  }

  function openEdit(client: MockEnterpriseClient) {
    setEditing(client);
    setForm({
      name: client.name, brand_name: client.brand_name, brand_link: client.brand_link,
      phone: client.phone, email: client.email, industry: client.industry,
      status: client.status, priority: client.priority,
      account_manager_id: client.account_manager_id, account_manager: client.account_manager,
      responsible_employee_id: client.responsible_employee_id, responsible_employee: client.responsible_employee,
      legal_company_name: client.legal_company_name,
      commercial_registration_number: client.commercial_registration_number,
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
    setActiveTab("basicInfo"); setError(""); setDialogOpen(true);
  }

  function handleEmployeeChange(field: "account_manager" | "responsible_employee", id: string) {
    const emp = id ? mockTeamMembers.find(m => m.id === id) : null;
    if (field === "account_manager") {
      setForm(f => ({ ...f, account_manager_id: id || null, account_manager: emp?.name || null }));
    } else {
      setForm(f => ({ ...f, responsible_employee_id: id || null, responsible_employee: emp?.name || null }));
    }
  }

  function simulateScan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setForm(f => ({
        ...f,
        legal_company_name: f.legal_company_name || "شركة نموذجية للتسويق",
        commercial_registration_number: f.commercial_registration_number || "1010" + Math.floor(100000 + Math.random() * 900000),
        city: f.city || "الرياض",
        district: f.district || "حي العليا",
        postal_code: f.postal_code || "11481",
        building_number: f.building_number || "A-1",
      }));
    }, 2000);
  }

  function addAttachment() {
    setFormAttachments(prev => [...prev, {
      id: `at-${Date.now()}`, name: "", attachment_type: "other",
      file_type: "pdf", file_size: "—", uploaded_by: "Current User", uploaded_at: new Date().toISOString(),
    }]);
  }

  function removeAttachment(id: string) { setFormAttachments(prev => prev.filter(a => a.id !== id)); }
  function updateAttachment(id: string, field: keyof ClientAttachment, value: string) {
    setFormAttachments(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }

  function validate(): boolean {
    if (!form.brand_name.trim()) { setError(t("clients.brandName") + " " + t("common.required")); setActiveTab("basicInfo"); return false; }
    return true;
  }

  function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      if (editing) {
        setClients(cs => cs.map(c => c.id === editing.id ? {
          ...c, ...form, attachments: formAttachments, updated_at: now,
          activity_log: [{ id: `al-${Date.now()}`, action_en: "Client updated", action_ar: "تم تحديث بيانات العميل", user: "Current User", timestamp: now, details: null }, ...c.activity_log],
        } : c));
      } else {
        setClients(cs => [{
          id: `ec-${Date.now()}`, ...form, attachments: formAttachments,
          activity_log: [{ id: `al-${Date.now()}`, action_en: "Client created", action_ar: "تم إنشاء العميل", user: "Current User", timestamp: now, details: null }],
          created_at: now, updated_at: now,
        }, ...cs]);
      }
      setSaving(false); setDialogOpen(false);
    }, 600);
  }

  function handleDelete() {
    if (!deleteId) return;
    setClients(cs => cs.filter(c => c.id !== deleteId));
    setDeleteId(null);
  }

  const tabLabels: Record<Tab, string> = {
    basicInfo: t("clients.basicInfo"), legalInfo: t("clients.legalInfo"),
    nationalAddress: t("clients.nationalAddress"), vatInfo: t("clients.vatInfo"),
    attachmentsSection: t("clients.attachmentsSection"), employeeSection: t("clients.employeeSection"),
  };

  const cs_form = getContractStatus(form.contract_end_date);

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
              <Bell className="w-3.5 h-3.5" />
              {remindersCount} {t("clients.contractReminders")}
            </div>
          )}
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            {t("clients.addClient")}
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
            {CLIENT_STATUSES.map(s => (
              <option key={s} value={s}>{t(`clients.statuses.${s}`)}</option>
            ))}
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
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground text-sm">
                    {search ? t("common.noData") : t("clients.noClients")}
                  </td>
                </tr>
              ) : filtered.map(client => {
                const cs = getContractStatus(client.contract_end_date);
                return (
                  <tr key={client.id} className={cn("hover:bg-muted/30 transition-colors",
                    (cs.type === "critical" || cs.type === "expired") && "bg-red-50/30 dark:bg-red-950/10"
                  )}>
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
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        {client.commercial_registration_number || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {client.vat_subject ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />{t("clients.vatSubjectShort")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <XCircle className="w-3.5 h-3.5" />{t("clients.vatExempt")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <ContractBadge endDate={client.contract_end_date} t={t} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_STYLES[client.status])}>
                        {t(`clients.statuses.${client.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/clients/${client.id}`}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title={t("clients.viewProfile")}>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => openEdit(client)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(client.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            {t("common.showing")} {filtered.length} {t("common.results")}
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10 flex-shrink-0">
              <div>
                <h2 className="font-semibold text-base">{editing ? t("clients.editClient") : t("clients.addClient")}</h2>
                {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
              </div>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex overflow-x-auto border-b border-border flex-shrink-0 bg-muted/20">
              {TABS.map((tab, idx) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn("px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                    activeTab === tab ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}>
                  <span className="me-1 opacity-60">{idx + 1}.</span>{tabLabels[tab]}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-5">

              {activeTab === "basicInfo" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={`${t("clients.brandName")} *`}>
                      <input value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} className={inputCls} />
                    </FormField>
                    <FormField label={t("clients.clientName")}>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                    </FormField>
                  </div>
                  <FormField label={t("clients.brandLink")}>
                    <div className="relative">
                      <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input value={form.brand_link} onChange={e => setForm(f => ({ ...f, brand_link: e.target.value }))}
                        className={cn(inputCls, "ps-9")} dir="ltr" placeholder="https://" />
                    </div>
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t("clients.phone")}>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className={cn(inputCls, "ps-9")} dir="ltr" placeholder="+966 5X XXX XXXX" />
                      </div>
                    </FormField>
                    <FormField label={t("clients.email")}>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} dir="ltr" />
                    </FormField>
                  </div>
                  <FormField label={t("clients.industry")}>
                    <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className={inputCls} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t("clients.status")}>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ClientStatus }))} className={inputCls}>
                        {CLIENT_STATUSES.map(s => <option key={s} value={s}>{t(`clients.statuses.${s}`)}</option>)}
                      </select>
                    </FormField>
                    <FormField label={t("clients.priority")}>
                      <select value={form.priority || ""} onChange={e => setForm(f => ({ ...f, priority: (e.target.value as ClientPriority) || null }))} className={inputCls}>
                        <option value="">{t("common.select")} ({t("common.optional")})</option>
                        {CLIENT_PRIORITIES.map(p => <option key={p} value={p}>{t(`clients.priorities.${p}`)}</option>)}
                      </select>
                    </FormField>
                  </div>
                  <FormField label={t("clients.accountManager")}>
                    <div className="relative">
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select value={form.account_manager_id || ""} onChange={e => handleEmployeeChange("account_manager", e.target.value)} className={cn(inputCls, "ps-9")}>
                        <option value="">{t("clients.selectEmployee")}</option>
                        {mockTeamMembers.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — {t(`roles.${emp.role}`)}</option>)}
                      </select>
                    </div>
                  </FormField>
                  <FormField label={t("common.notes")}>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={cn(inputCls, "h-auto resize-none")} />
                  </FormField>
                </div>
              )}

              {activeTab === "legalInfo" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{t("clients.scanHint")}</p>
                    <button onClick={simulateScan} disabled={scanning}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60">
                      {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                      {scanning ? t("clients.scanning") : t("clients.scanQR")}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t("clients.legalCompanyName")}>
                      <div className="relative">
                        <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.legal_company_name} onChange={e => setForm(f => ({ ...f, legal_company_name: e.target.value }))} className={cn(inputCls, "ps-9")} />
                      </div>
                    </FormField>
                    <FormField label={t("clients.companyType")}>
                      <input value={form.company_type} onChange={e => setForm(f => ({ ...f, company_type: e.target.value }))} className={inputCls} />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t("clients.commercialRegistrationNumber")}>
                      <input value={form.commercial_registration_number} onChange={e => setForm(f => ({ ...f, commercial_registration_number: e.target.value }))} className={inputCls} dir="ltr" />
                    </FormField>
                    <FormField label={t("clients.crExpiryDate")}>
                      <input type="date" value={form.cr_expiry_date?.split("T")[0] || ""} onChange={e => setForm(f => ({ ...f, cr_expiry_date: e.target.value }))} className={inputCls} dir="ltr" />
                    </FormField>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {t("clients.contractDates")}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label={t("clients.contractStartDate")}>
                        <input type="date" value={form.contract_start_date?.split("T")[0] || ""} onChange={e => setForm(f => ({ ...f, contract_start_date: e.target.value || null }))} className={inputCls} dir="ltr" />
                      </FormField>
                      <FormField label={t("clients.contractEndDate")}>
                        <input type="date" value={form.contract_end_date?.split("T")[0] || ""} onChange={e => setForm(f => ({ ...f, contract_end_date: e.target.value || null }))} className={inputCls} dir="ltr" />
                      </FormField>
                    </div>

                    {form.contract_end_date && cs_form.type && (
                      <div className={cn("mt-3 p-3 rounded-xl border text-sm flex items-start gap-3",
                        cs_form.type === "expired"  ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400" :
                        cs_form.type === "critical" ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400" :
                        cs_form.type === "warning"  ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400" :
                        "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400"
                      )}>
                        {cs_form.type === "expired" ? <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                         cs_form.type === "ok" ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                         <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-xs">
                            {cs_form.type === "expired" ? t("clients.contractExpired") :
                             cs_form.type === "ok" ? t("clients.contractActive") :
                             t("clients.daysLeft", { count: cs_form.daysLeft })}
                          </p>
                          <p className="text-xs opacity-80 mt-0.5">
                            {cs_form.type !== "expired" && cs_form.type !== "ok" && t("clients.reminderNote")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "nationalAddress" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t("clients.country")}>
                      <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className={inputCls} />
                    </FormField>
                    <FormField label={t("clients.city")}>
                      <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} />
                    </FormField>
                  </div>
                  <FormField label={t("clients.district")}>
                    <input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className={inputCls} />
                  </FormField>
                  <FormField label={t("clients.streetName")}>
                    <input value={form.street_name} onChange={e => setForm(f => ({ ...f, street_name: e.target.value }))} className={inputCls} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label={t("clients.buildingNumber")}>
                      <input value={form.building_number} onChange={e => setForm(f => ({ ...f, building_number: e.target.value }))} className={inputCls} dir="ltr" />
                    </FormField>
                    <FormField label={t("clients.additionalNumber")}>
                      <input value={form.additional_number} onChange={e => setForm(f => ({ ...f, additional_number: e.target.value }))} className={inputCls} dir="ltr" />
                    </FormField>
                  </div>
                  <FormField label={t("clients.postalCode")}>
                    <input value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} className={inputCls} dir="ltr" />
                  </FormField>
                </div>
              )}

              {activeTab === "vatInfo" && (
                <div className="space-y-5">
                  <FormField label={t("clients.vatSubject")}>
                    <div className="flex gap-3 mt-1">
                      <label className={cn("flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                        form.vat_subject ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30")}>
                        <input type="radio" checked={form.vat_subject} onChange={() => setForm(f => ({ ...f, vat_subject: true }))} className="sr-only" />
                        <CheckCircle2 className={cn("w-4 h-4", form.vat_subject ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-medium">{t("clients.vatYes")}</span>
                      </label>
                      <label className={cn("flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                        !form.vat_subject ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30")}>
                        <input type="radio" checked={!form.vat_subject} onChange={() => setForm(f => ({ ...f, vat_subject: false }))} className="sr-only" />
                        <XCircle className={cn("w-4 h-4", !form.vat_subject ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-medium">{t("clients.vatNo")}</span>
                      </label>
                    </div>
                  </FormField>
                  {form.vat_subject && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
                      <FormField label={t("clients.vatRegisteredName")}>
                        <input value={form.vat_registered_name} onChange={e => setForm(f => ({ ...f, vat_registered_name: e.target.value }))} className={inputCls} />
                      </FormField>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label={t("clients.vatNumber")}>
                          <input value={form.vat_number} onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))} className={inputCls} dir="ltr" placeholder="3XXXXXXXXXXXXXXXXX" />
                        </FormField>
                        <FormField label={t("clients.vatExpiryDate")}>
                          <input type="date" value={form.vat_expiry_date?.split("T")[0] || ""} onChange={e => setForm(f => ({ ...f, vat_expiry_date: e.target.value }))} className={inputCls} dir="ltr" />
                        </FormField>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "attachmentsSection" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t("clients.attachmentsSection")} ({t("common.optional")})</p>
                    <button onClick={addAttachment}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                      <Upload className="w-3.5 h-3.5" />{t("clients.addAttachment")}
                    </button>
                  </div>
                  {formAttachments.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />{t("clients.noAttachments")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formAttachments.map(att => (
                        <div key={att.id} className="bg-muted/30 rounded-xl p-3 border border-border">
                          <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <FormField label={t("clients.attachmentName")}>
                                <input value={att.name} onChange={e => updateAttachment(att.id, "name", e.target.value)} className={inputCls} />
                              </FormField>
                              <FormField label={t("clients.attachmentType")}>
                                <select value={att.attachment_type} onChange={e => updateAttachment(att.id, "attachment_type", e.target.value)} className={inputCls}>
                                  {ATTACHMENT_TYPES.map(type => <option key={type} value={type}>{t(`clients.attachmentTypes.${type}`)}</option>)}
                                </select>
                              </FormField>
                            </div>
                            <button onClick={() => removeAttachment(att.id)} className="p-1 hover:bg-red-100 rounded text-muted-foreground hover:text-red-600 transition-colors flex-shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "employeeSection" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{t("clients.responsibleEmployee")} — {t("clients.responsibleEmployeeHint")}</p>
                  <div className="grid gap-3">
                    <label className={cn("flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors",
                      !form.responsible_employee_id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    )}>
                      <input type="radio" checked={!form.responsible_employee_id}
                        onChange={() => setForm(f => ({ ...f, responsible_employee_id: null, responsible_employee: null }))} className="sr-only" />
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">{t("clients.selectEmployee")}</span>
                    </label>
                    {mockTeamMembers.map(emp => (
                      <label key={emp.id} className={cn("flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors",
                        form.responsible_employee_id === emp.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                      )}>
                        <input type="radio" checked={form.responsible_employee_id === emp.id}
                          onChange={() => handleEmployeeChange("responsible_employee", emp.id)} className="sr-only" />
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{emp.avatar_initials}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{t(`roles.${emp.role}`)}</p>
                        </div>
                        {form.responsible_employee_id === emp.id && <CheckCircle2 className="w-4 h-4 text-primary ms-auto flex-shrink-0" />}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex gap-2">
                {activeTab !== TABS[0] && (
                  <button onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) - 1])}
                    className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                    {t("common.previous")}
                  </button>
                )}
                {activeTab !== TABS[TABS.length - 1] && (
                  <button onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) + 1])}
                    className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1">
                    {t("common.next")} <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                  {t("common.cancel")}
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t("common.save")}
                </button>
              </div>
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
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                {t("common.cancel")}
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors">
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
