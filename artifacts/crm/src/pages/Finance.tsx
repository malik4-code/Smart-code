import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, TrendingUp, AlertTriangle, Clock, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockFinanceRecords, type MockFinanceRecord } from "../lib/enterpriseData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function Finance() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockFinanceRecords.filter(r => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch = r.campaign_name.includes(search) || r.client_name.includes(search) || r.influencer_name.includes(search);
    return matchStatus && matchSearch;
  });

  const totalRevenue = mockFinanceRecords.reduce((s, r) => s + r.client_price, 0);
  const totalCost = mockFinanceRecords.reduce((s, r) => s + r.final_cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = mockFinanceRecords.length > 0
    ? (mockFinanceRecords.reduce((s, r) => s + r.profit_margin, 0) / mockFinanceRecords.length).toFixed(1)
    : 0;

  const overdueCount = mockFinanceRecords.filter(r => r.status === "overdue").length;
  const pendingInvoiceCount = mockFinanceRecords.filter(r => r.status === "pending").length;

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    invoiced: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  // Chart data
  const campaignData = Object.values(
    mockFinanceRecords.reduce((acc, r) => {
      const key = r.campaign_name.split("—")[0].trim();
      if (!acc[key]) acc[key] = { name: key, revenue: 0, cost: 0, profit: 0 };
      acc[key].revenue += r.client_price;
      acc[key].cost += r.final_cost;
      acc[key].profit += r.client_price - r.final_cost;
      return acc;
    }, {} as Record<string, { name: string; revenue: number; cost: number; profit: number }>)
  );

  const statusPieData = [
    { name: t("finance.statuses.paid"), value: mockFinanceRecords.filter(r => r.status === "paid").length, color: "#22c55e" },
    { name: t("finance.statuses.invoiced"), value: mockFinanceRecords.filter(r => r.status === "invoiced").length, color: "#3b82f6" },
    { name: t("finance.statuses.pending"), value: mockFinanceRecords.filter(r => r.status === "pending").length, color: "#94a3b8" },
    { name: t("finance.statuses.overdue"), value: mockFinanceRecords.filter(r => r.status === "overdue").length, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("finance.title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("finance.subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("finance.totalRevenue"), value: totalRevenue.toLocaleString() + " ر.س", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-950/50", sub: null },
          { label: t("finance.totalProfit"), value: totalProfit.toLocaleString() + " ر.س", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/50", sub: `${avgMargin}% ${t("finance.avgMargin")}` },
          { label: t("finance.overduePayments"), value: overdueCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-950/50", sub: null },
          { label: t("finance.pendingInvoices"), value: pendingInvoiceCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/50", sub: null },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">{t("reports.budgetByClient")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={campaignData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => (v / 1000) + "K"} />
              <Tooltip formatter={(v: number) => v.toLocaleString() + " ر.س"} />
              <Bar dataKey="revenue" name={t("finance.clientPrice")} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name={t("finance.finalCost")} fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name={t("finance.totalProfit")} fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">{t("common.status")} {t("finance.title")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statusPieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <h3 className="font-semibold text-sm">{t("finance.title")} — {t("common.all")}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                className="ps-8 pe-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t("common.search")}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border border-border rounded-lg px-2 py-1.5 text-xs bg-background focus:outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">{t("common.all")}</option>
              {["pending", "invoiced", "paid", "overdue"].map(s => (
                <option key={s} value={s}>{t(`finance.statuses.${s}`)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("finance.campaign"), t("finance.client"), t("finance.influencer"),
                  t("finance.finalCost"), t("finance.clientPrice"), t("finance.profitMargin"),
                  t("common.status"), t("finance.paymentDate")].map(h => (
                  <th key={h} className="px-4 py-3 text-start text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">{t("finance.noRecords")}</td></tr>
              ) : filtered.map(record => (
                <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium max-w-[140px] truncate">{record.campaign_name}</td>
                  <td className="px-4 py-3 text-xs">{record.client_name}</td>
                  <td className="px-4 py-3 text-xs font-medium">{record.influencer_name}</td>
                  <td className="px-4 py-3 text-xs">
                    <span>{record.final_cost.toLocaleString()}</span>
                    {record.discount > 0 && (
                      <span className="ms-1 text-emerald-600 text-xs">(-{record.discount.toLocaleString()})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-emerald-600">{record.client_price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-bold", record.profit_margin > 20 ? "text-emerald-600" : record.profit_margin > 10 ? "text-amber-600" : "text-red-600")}>
                      {record.profit_margin}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[record.status])}>
                      {t(`finance.statuses.${record.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {record.payment_date ? record.payment_date : record.invoice_date ? record.invoice_date : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
