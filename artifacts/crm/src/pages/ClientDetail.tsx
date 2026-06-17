import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft, Building2, Phone, Mail, Globe, MapPin, FileText,
  CheckCircle2, XCircle, User, Clock, ExternalLink,
  Megaphone, ChevronRight, Paperclip, Calendar, Bell,
  AlertTriangle, ShieldAlert, TrendingUp, StickyNote, Receipt, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mockEnterpriseClients, mockCampaigns, mockDocuments, getContractStatus,
  type ClientStatus, type ClientPriority
} from "../lib/enterpriseData";

type DetailTab = "overview" | "campaigns" | "contracts" | "attachments" | "invoices" | "activity" | "notes";

function timeAgo(ts: string, isAr: boolean): string {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return isAr ? "الآن" : "Just now";
  if (diff < 3600) return isAr ? `${Math.floor(diff / 60)} د` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return isAr ? `${Math.floor(diff / 3600)} س` : `${Math.floor(diff / 3600)}h ago`;
  return isAr ? `${Math.floor(diff / 86400)} ي` : `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_STYLES: Record<ClientStatus, string> = {
  prospect:       "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  active:         "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  suspended:      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  contract_ended: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  inactive:       "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const PRIORITY_STYLES: Record<ClientPriority, string> = {
  high:   "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low:    "bg-gray-50 text-gray-500 border-gray-200",
};

const FILE_ICON_BG: Record<string, string> = {
  pdf: "bg-red-100 text-red-600", docx: "bg-blue-100 text-blue-600",
  xlsx: "bg-emerald-100 text-emerald-600", pptx: "bg-orange-100 text-orange-600",
  image: "bg-purple-100 text-purple-600", other: "bg-gray-100 text-gray-600",
};

export default function ClientDetail() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [, params] = useRoute("/clients/:id");
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  const client = mockEnterpriseClients.find(c => c.id === params?.id);
  const relatedCampaigns = mockCampaigns.filter(c => c.client_id === client?.id || c.client_name === client?.brand_name);
  const cs = getContractStatus(client?.contract_end_date ?? null);

  const clientContracts = mockDocuments.filter(d => d.folder === "contracts" && d.client_name === client?.brand_name);
  const clientInvoices = mockDocuments.filter(d => d.folder === "invoices" && d.client_name === client?.brand_name);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("errors.notFound")}</p>
        <Link href="/clients" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />{t("common.backToList")}
        </Link>
      </div>
    );
  }

  const STAGE_ORDER = [
    "new_request","request_review","influencer_shortlisting","internal_approval",
    "client_review","client_approval","influencer_outreach","negotiation",
    "contract_confirmation","content_production","content_approval","publishing",
    "performance_tracking","final_report","campaign_closed",
  ];

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "overview",     label: t("common.viewDetails") },
    { key: "campaigns",    label: `${t("clients.relatedCampaigns")} (${relatedCampaigns.length})` },
    { key: "contracts",    label: `${t("clients.contractsTab")} (${clientContracts.length})` },
    { key: "attachments",  label: `${t("clients.attachmentsSection")} (${client.attachments.length})` },
    { key: "invoices",     label: `${t("clients.invoicesTab")} (${clientInvoices.length})` },
    { key: "activity",     label: t("clients.clientActivity") },
    { key: "notes",        label: t("clients.notesTab") },
  ];

  const contractBannerCfg = {
    expired:  { cls: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300",  Icon: XCircle },
    critical: { cls: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-300", Icon: ShieldAlert },
    warning:  { cls: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300",  Icon: Bell },
    ok:       null,
  };

  function addNote() {
    if (!newNote.trim()) return;
    setNotes(n => [newNote.trim(), ...n]);
    setNewNote("");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{client.brand_name}</h1>
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_STYLES[client.status])}>
              {t(`clients.statuses.${client.status}`)}
            </span>
            {client.priority && (
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", PRIORITY_STYLES[client.priority])}>
                {t(`clients.priorities.${client.priority}`)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{client.legal_company_name}</p>
        </div>
      </div>

      {cs.type && cs.type !== "ok" && contractBannerCfg[cs.type] && (() => {
        const { cls, Icon } = contractBannerCfg[cs.type]!;
        return (
          <div className={cn("flex items-start gap-3 p-4 rounded-xl border", cls)}>
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">
                {cs.type === "expired"
                  ? t("clients.contractExpiredBanner")
                  : t("clients.contractEndingBanner", { count: cs.daysLeft })}
              </p>
              <p className="text-xs mt-0.5 opacity-80">
                {t("clients.contractEnd")}: {client.contract_end_date ? new Date(client.contract_end_date).toLocaleDateString(isAr ? "ar-SA" : "en-SA") : "—"}
                {" · "}{t("clients.reminderNote")}
              </p>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-primary">{client.brand_name.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-lg leading-tight">{client.brand_name}</h2>
                <p className="text-sm text-muted-foreground">{client.industry}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {client.name && <ContactRow icon={<User className="w-4 h-4" />} value={client.name} />}
              {client.phone && <ContactRow icon={<Phone className="w-4 h-4" />} value={client.phone} ltr />}
              {client.email && <ContactRow icon={<Mail className="w-4 h-4" />} value={client.email} ltr />}
              {client.brand_link && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href={client.brand_link} target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline truncate flex items-center gap-1 text-sm">
                    {client.brand_link.replace(/^https?:\/\//, "")}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
              {client.city && <ContactRow icon={<MapPin className="w-4 h-4" />} value={[client.district, client.city, client.country].filter(Boolean).join("، ")} />}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm">{t("clients.legalInfo")}</h3>
            <InfoRow label={t("clients.legalCompanyName")} value={client.legal_company_name} />
            <InfoRow label={t("clients.companyType")} value={client.company_type} />
            <InfoRow label={t("clients.crNumber")} value={client.commercial_registration_number} mono />
            {client.cr_expiry_date && <InfoRow label={t("clients.crExpiryDate")} value={new Date(client.cr_expiry_date).toLocaleDateString(isAr ? "ar-SA" : "en-SA")} />}
            <InfoRow label={t("clients.vatStatus")} value={
              client.vat_subject
                ? <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />{t("clients.vatSubjectShort")}</span>
                : <span className="flex items-center gap-1 text-muted-foreground"><XCircle className="w-3.5 h-3.5" />{t("clients.vatExempt")}</span>
            } />
            {client.vat_subject && client.vat_number && <InfoRow label={t("clients.vatNumber")} value={client.vat_number} mono />}
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {t("clients.contractDates")}
            </h3>
            {client.contract_start_date ? (
              <InfoRow label={t("clients.contractStartDate")} value={new Date(client.contract_start_date).toLocaleDateString(isAr ? "ar-SA" : "en-SA")} />
            ) : null}
            {client.contract_end_date ? (
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{t("clients.contractEndDate")}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{new Date(client.contract_end_date).toLocaleDateString(isAr ? "ar-SA" : "en-SA")}</p>
                  {cs.type && cs.type !== "ok" && (
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                      cs.type === "expired" ? "bg-red-100 text-red-700" :
                      cs.type === "critical" ? "bg-orange-100 text-orange-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {cs.type === "expired" ? t("clients.contractExpired") : t("clients.daysLeft", { count: cs.daysLeft })}
                    </span>
                  )}
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">{t("clients.noContractDate")}</p>}
          </div>

          {(client.account_manager || client.responsible_employee) && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-sm">{t("clients.assignedTeam")}</h3>
              {client.account_manager && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{client.account_manager}</p>
                    <p className="text-xs text-muted-foreground">{t("clients.accountManager")}</p>
                  </div>
                </div>
              )}
              {client.responsible_employee && client.responsible_employee !== client.account_manager && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{client.responsible_employee}</p>
                    <p className="text-xs text-muted-foreground">{t("clients.responsibleEmployee")}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={cn("px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "overview" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-sm mb-3">{t("clients.nationalAddress")}</h3>
                    <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-xl p-4">
                      <InfoRow label={t("clients.country")} value={client.country} />
                      <InfoRow label={t("clients.city")} value={client.city} />
                      <InfoRow label={t("clients.district")} value={client.district} />
                      <InfoRow label={t("clients.streetName")} value={client.street_name} />
                      <InfoRow label={t("clients.buildingNumber")} value={client.building_number} mono />
                      <InfoRow label={t("clients.additionalNumber")} value={client.additional_number} mono />
                      <InfoRow label={t("clients.postalCode")} value={client.postal_code} mono />
                    </div>
                  </div>
                  {client.vat_subject && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3">{t("clients.vatInfo")}</h3>
                      <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-xl p-4">
                        <InfoRow label={t("clients.vatRegisteredName")} value={client.vat_registered_name} />
                        <InfoRow label={t("clients.vatNumber")} value={client.vat_number} mono />
                        {client.vat_expiry_date && <InfoRow label={t("clients.vatExpiryDate")} value={new Date(client.vat_expiry_date).toLocaleDateString(isAr ? "ar-SA" : "en-SA")} />}
                      </div>
                    </div>
                  )}
                  {client.notes && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">{t("common.notes")}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-4">{client.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "campaigns" && (
                <div className="space-y-3">
                  {relatedCampaigns.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {t("campaigns.noCampaigns")}
                    </div>
                  ) : relatedCampaigns.map(c => {
                    const pct = Math.round((STAGE_ORDER.indexOf(c.current_stage) + 1) / 15 * 100);
                    return (
                      <Link key={c.id} href={`/campaigns/${c.id}`}
                        className="block p-4 rounded-xl border border-border hover:shadow-md hover:-translate-y-0.5 transition-all group">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.account_manager} · {c.start_date} → {c.end_date}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                              c.status === "active" ? "bg-green-100 text-green-700" :
                              c.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                            )}>{t(`campaigns.statuses.${c.status}`)}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{pct}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t(`campaigns.stages.${c.current_stage}`)}</p>
                      </Link>
                    );
                  })}
                </div>
              )}

              {activeTab === "contracts" && (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />{t("clients.contractDates")}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {client.contract_start_date && <InfoRow label={t("clients.contractStartDate")} value={new Date(client.contract_start_date).toLocaleDateString(isAr ? "ar-SA" : "en-SA")} />}
                      {client.contract_end_date && (
                        <div>
                          <p className="text-xs text-muted-foreground">{t("clients.contractEndDate")}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm font-medium">{new Date(client.contract_end_date).toLocaleDateString(isAr ? "ar-SA" : "en-SA")}</p>
                            {cs.type && cs.type !== "ok" && (
                              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                                cs.type === "expired" ? "bg-red-100 text-red-700" :
                                cs.type === "critical" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {cs.type === "expired" ? t("clients.contractExpired") : t("clients.daysLeft", { count: cs.daysLeft })}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {client.contract_start_date && client.contract_end_date && (
                      <div className="text-xs text-muted-foreground bg-card rounded-lg p-3 border border-border">
                        {t("clients.reminderNote")}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {isAr ? "مستندات العقود" : "Contract Documents"}
                    </h4>
                    {clientContracts.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">
                        <FileText className="w-7 h-7 mx-auto mb-2 opacity-30" />
                        {isAr ? "لا توجد مستندات عقود" : "No contract documents"}
                      </div>
                    ) : clientContracts.map(doc => (
                      <DocRow key={doc.id} doc={doc} t={t} isAr={isAr} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="space-y-3">
                  {client.attachments.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-30" />{t("clients.noAttachments")}
                    </div>
                  ) : client.attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", FILE_ICON_BG[att.file_type] || FILE_ICON_BG.other)}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{att.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t(`clients.attachmentTypes.${att.attachment_type}`)} · {att.file_size} · {t("clients.uploadedBy")} {att.uploaded_by}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 uppercase font-mono bg-muted px-2 py-0.5 rounded">{att.file_type}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "invoices" && (
                <div className="space-y-3">
                  {clientInvoices.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {t("clients.noInvoices")}
                    </div>
                  ) : clientInvoices.map(doc => (
                    <DocRow key={doc.id} doc={doc} t={t} isAr={isAr} />
                  ))}
                </div>
              )}

              {activeTab === "activity" && (
                <div>
                  {client.activity_log.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />{t("clients.noActivity")}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute start-4 top-0 bottom-0 w-0.5 bg-border" />
                      {client.activity_log.map((entry, idx) => (
                        <div key={entry.id} className={cn("relative flex gap-4 pb-5", idx === client.activity_log.length - 1 && "pb-0")}>
                          <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center flex-shrink-0 z-10">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="flex-1 pt-1 min-w-0">
                            <p className="text-sm font-medium">{isAr ? entry.action_ar : entry.action_en}</p>
                            {entry.details && <p className="text-xs text-muted-foreground mt-0.5 font-mono">{entry.details}</p>}
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{entry.user}</span>
                              <span>·</span>
                              <span>{timeAgo(entry.timestamp, isAr)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      rows={3}
                      placeholder={isAr ? "أضف ملاحظة جديدة..." : "Add a new note..."}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                    <button onClick={addNote}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Plus className="w-4 h-4" />{t("clients.addNote")}
                    </button>
                  </div>
                  {notes.length === 0 && !client.notes ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {t("clients.noNotes")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note, i) => (
                        <div key={i} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-sm">{note}</p>
                          <p className="text-xs text-muted-foreground mt-2">{new Date().toLocaleDateString(isAr ? "ar-SA" : "en-SA")}</p>
                        </div>
                      ))}
                      {client.notes && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border">
                          <p className="text-sm">{client.notes}</p>
                          <p className="text-xs text-muted-foreground mt-2">{isAr ? "ملاحظة مضافة" : "From client record"}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocRow({ doc, t, isAr }: { doc: { id: string; name: string; file_type: string; file_size: string; uploaded_by: string; uploaded_at: string; campaign_name: string | null; tags: string[] }; t: (k: string) => string; isAr: boolean }) {
  const bgCls = (FILE_ICON_BG as Record<string, string>)[doc.file_type] || FILE_ICON_BG.other;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors mb-2">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", bgCls)}>
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{doc.name}</p>
        <p className="text-xs text-muted-foreground">
          {doc.file_size} · {t("documents.uploadedBy")} {doc.uploaded_by}
          {doc.campaign_name && ` · ${doc.campaign_name}`}
        </p>
        {doc.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {doc.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0 uppercase font-mono bg-muted px-2 py-0.5 rounded">{doc.file_type}</span>
    </div>
  );
}

function ContactRow({ icon, value, ltr = false }: { icon: React.ReactNode; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground flex-shrink-0">{icon}</span>
      <span className={cn("text-muted-foreground text-sm truncate", ltr && "direction-ltr")} dir={ltr ? "ltr" : undefined}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (!value || value === "") return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium", mono && "font-mono")}>{value}</p>
    </div>
  );
}
