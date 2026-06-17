import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Client } from "../lib/supabase";
import { mockClients } from "../lib/mockData";

const emptyForm = {
  name: "", industry: "", email: "", phone: "",
  address: "", website: "", contact_person: "",
  status: "active" as "active" | "inactive", notes: "",
};

export default function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    if (!isSupabaseConfigured) {
      setClients([...mockClients] as Client[]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients((data || []) as Client[]);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({
      name: client.name, industry: client.industry || "", email: client.email || "",
      phone: client.phone || "", address: client.address || "", website: client.website || "",
      contact_person: client.contact_person || "", status: client.status, notes: client.notes || "",
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError(t("common.required")); return; }
    setSaving(true); setError("");
    try {
      if (!isSupabaseConfigured) {
        const now = new Date().toISOString();
        if (editing) {
          setClients(c => c.map(item => item.id === editing.id ? { ...item, ...form, updated_at: now } : item));
        } else {
          setClients(c => [{ ...form, id: `demo-${Date.now()}`, created_at: now, updated_at: now }, ...c]);
        }
        setDialogOpen(false);
        return;
      }
      if (editing) {
        const { error: err } = await supabase.from("clients").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("clients").insert(form);
        if (err) throw err;
      }
      setDialogOpen(false); fetchClients();
    } catch { setError(t("errors.saveFailed")); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    if (!isSupabaseConfigured) { setClients(c => c.filter(item => item.id !== deleteId)); setDeleteId(null); return; }
    await supabase.from("clients").delete().eq("id", deleteId);
    setDeleteId(null); fetchClients();
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("clients.subtitle")}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t("clients.addClient")}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("clients.search")}
          className="w-full h-10 ps-9 pe-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("clients.clientName")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("clients.industry")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("clients.email")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("clients.phone")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("clients.status")}</th>
                <th className="text-start px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    {search ? t("common.noData") : t("clients.noClients")}
                  </td>
                </tr>
              ) : filtered.map(client => (
                <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">{client.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{client.industry || "—"}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{client.email || "—"}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{client.phone || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium",
                      client.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                      {t(`clients.${client.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            {t("common.showing")} {filtered.length} {t("common.results")}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-base">{editing ? t("clients.editClient") : t("clients.addClient")}</h2>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-950/30 dark:text-red-400">{error}</div>}
              <FormField label={`${t("clients.clientName")} *`}>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label={t("clients.industry")}>
                  <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className={inputCls} />
                </FormField>
                <FormField label={t("clients.status")}>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as "active" | "inactive" }))} className={inputCls}>
                    <option value="active">{t("clients.active")}</option>
                    <option value="inactive">{t("clients.inactive")}</option>
                  </select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label={t("clients.email")}>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
                <FormField label={t("clients.phone")}>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} dir="ltr" />
                </FormField>
              </div>
              <FormField label={t("clients.contactPerson")}>
                <input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label={t("clients.website")}>
                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className={inputCls} dir="ltr" />
              </FormField>
              <FormField label={t("clients.address")}>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label={t("clients.notes")}>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={cn(inputCls, "resize-none")} />
              </FormField>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border px-5 py-4 flex items-center justify-end gap-3">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                {t("common.cancel")}
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {saving ? "..." : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
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
