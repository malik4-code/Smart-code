import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Flag, Star, Megaphone, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { mockTasks, mockProjects } from "../lib/mockData";
import { mockCampaigns, mockEnterpriseClients, getContractStatus } from "../lib/enterpriseData";

type CalEventType = "task" | "project" | "campaign" | "national" | "religious" | "marketing" | "holiday" | "contract";

interface CalEvent {
  id: string;
  date: string;
  title: string;
  title_ar: string;
  type: CalEventType;
  priority?: string;
}

const TYPE_STYLES: Record<CalEventType, { dot: string; bg: string; text: string; label_en: string; label_ar: string }> = {
  task:     { dot: "bg-blue-500",    bg: "bg-blue-100 dark:bg-blue-900/40",      text: "text-blue-700 dark:text-blue-300",     label_en: "Task",              label_ar: "مهمة" },
  project:  { dot: "bg-violet-500",  bg: "bg-violet-100 dark:bg-violet-900/40",  text: "text-violet-700 dark:text-violet-300", label_en: "Project",           label_ar: "مشروع" },
  campaign: { dot: "bg-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/40",text: "text-emerald-700 dark:text-emerald-300",label_en: "Campaign",          label_ar: "حملة" },
  national: { dot: "bg-green-600",   bg: "bg-green-100 dark:bg-green-900/40",    text: "text-green-700 dark:text-green-300",   label_en: "National Day",      label_ar: "يوم وطني" },
  religious:{ dot: "bg-purple-500",  bg: "bg-purple-100 dark:bg-purple-900/40",  text: "text-purple-700 dark:text-purple-300", label_en: "Religious",         label_ar: "مناسبة دينية" },
  marketing:{ dot: "bg-orange-500",  bg: "bg-orange-100 dark:bg-orange-900/40",  text: "text-orange-700 dark:text-orange-300", label_en: "Marketing Season",  label_ar: "موسم تسويقي" },
  holiday:  { dot: "bg-sky-500",     bg: "bg-sky-100 dark:bg-sky-900/40",        text: "text-sky-700 dark:text-sky-300",       label_en: "Public Holiday",    label_ar: "إجازة رسمية" },
  contract: { dot: "bg-red-500",     bg: "bg-red-100 dark:bg-red-900/40",        text: "text-red-700 dark:text-red-300",       label_en: "Contract Reminder", label_ar: "تذكير عقد" },
};

const TYPE_ICONS: Record<CalEventType, React.ReactNode> = {
  national:  <Flag className="w-3 h-3" />,
  religious: <Star className="w-3 h-3" />,
  marketing: <Megaphone className="w-3 h-3" />,
  holiday:   <CalIcon className="w-3 h-3" />,
  campaign:  <Megaphone className="w-3 h-3" />,
  contract:  <Bell className="w-3 h-3" />,
  task:      null,
  project:   null,
};

function mkDate(y: number, mm: number, dd: number) {
  return `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function getSaudiOccasions(): CalEvent[] {
  const events: CalEvent[] = [];
  for (const y of [2024, 2025, 2026, 2027]) {
    events.push(
      { id: `newyear-${y}`,   date: mkDate(y,1,1),   title: `New Year's Day ${y}`,     title_ar: `رأس السنة الميلادية ${y}`,     type: "holiday" },
      { id: `founding-${y}`,  date: mkDate(y,2,22),  title: `Saudi Founding Day ${y}`, title_ar: `يوم التأسيس السعودي ${y}`,    type: "national" },
      { id: `national-${y}`,  date: mkDate(y,9,23),  title: `Saudi National Day ${y}`, title_ar: `اليوم الوطني السعودي ${y}`,    type: "national" },
      { id: `bts-${y}`,       date: mkDate(y,9,1),   title: `Back to School ${y}`,     title_ar: `العودة للمدارس ${y}`,          type: "marketing" },
    );
  }
  const hijriDates: CalEvent[] = [
    { id: "ramadan-2025",   date: "2025-03-01", title: "Ramadan 2025",        title_ar: "رمضان المبارك 2025",        type: "religious" },
    { id: "eid-fitr-2025",  date: "2025-03-30", title: "Eid Al-Fitr 2025",    title_ar: "عيد الفطر المبارك 2025",    type: "religious" },
    { id: "eid-adha-2025",  date: "2025-06-06", title: "Eid Al-Adha 2025",    title_ar: "عيد الأضحى المبارك 2025",   type: "religious" },
    { id: "wfriday-2025",   date: "2025-11-28", title: "White Friday 2025",   title_ar: "الجمعة البيضاء 2025",       type: "marketing" },
    { id: "ramadan-2026",   date: "2026-02-17", title: "Ramadan 2026",        title_ar: "رمضان المبارك 2026",        type: "religious" },
    { id: "eid-fitr-2026",  date: "2026-03-19", title: "Eid Al-Fitr 2026",    title_ar: "عيد الفطر المبارك 2026",    type: "religious" },
    { id: "eid-adha-2026",  date: "2026-05-27", title: "Eid Al-Adha 2026",    title_ar: "عيد الأضحى المبارك 2026",   type: "religious" },
    { id: "wfriday-2026",   date: "2026-11-27", title: "White Friday 2026",   title_ar: "الجمعة البيضاء 2026",       type: "marketing" },
    { id: "ramadan-2027",   date: "2027-02-06", title: "Ramadan 2027",        title_ar: "رمضان المبارك 2027",        type: "religious" },
    { id: "eid-fitr-2027",  date: "2027-03-08", title: "Eid Al-Fitr 2027",    title_ar: "عيد الفطر المبارك 2027",    type: "religious" },
    { id: "eid-adha-2027",  date: "2027-05-16", title: "Eid Al-Adha 2027",    title_ar: "عيد الأضحى المبارك 2027",   type: "religious" },
    { id: "wfriday-2027",   date: "2027-11-26", title: "White Friday 2027",   title_ar: "الجمعة البيضاء 2027",       type: "marketing" },
  ];
  return [...events, ...hijriDates];
}

const SAUDI_OCCASIONS = getSaudiOccasions();

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { isRTL } = useLanguage();
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<CalEventType>>(
    new Set(["task", "project", "campaign", "national", "religious", "marketing", "holiday", "contract"])
  );

  function prevMonth() { setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1)); }
  function nextMonth() { setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1)); }
  function goToday() { setCurrent(new Date(today.getFullYear(), today.getMonth(), 1)); }

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const monthKeys = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const dayKeys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

  const cells: { day: number; month: "prev"|"cur"|"next"; dateStr: string }[] = [];
  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrev - firstDay + 1 + i;
    const mm = month === 0 ? 12 : month; const yy = month === 0 ? year - 1 : year;
    cells.push({ day: d, month: "prev", dateStr: mkDate(yy, mm, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: "cur", dateStr: mkDate(year, month + 1, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const mm = month === 11 ? 1 : month + 2; const yy = month === 11 ? year + 1 : year;
    cells.push({ day: d, month: "next", dateStr: mkDate(yy, mm, d) });
  }

  const todayStr = mkDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const start = mkDate(year, month + 1, 1);
  const end = mkDate(year, month + 1, daysInMonth);

  const allEvents: CalEvent[] = [
    ...mockTasks
      .filter(t => t.due_date && t.due_date >= start && t.due_date <= end && t.status !== "cancelled")
      .map(t => ({ id: t.id, date: t.due_date!, title: t.title, title_ar: t.title, type: "task" as CalEventType, priority: t.priority })),
    ...mockProjects
      .filter(p => p.end_date && p.end_date >= start && p.end_date <= end && p.status !== "cancelled")
      .map(p => ({ id: p.id, date: p.end_date!, title: p.name, title_ar: p.name, type: "project" as CalEventType })),
    ...mockCampaigns
      .filter(c => c.status === "active" && ((c.start_date >= start && c.start_date <= end) || (c.end_date >= start && c.end_date <= end)))
      .flatMap(c => {
        const evts: CalEvent[] = [];
        if (c.start_date >= start && c.start_date <= end)
          evts.push({ id: `cs-${c.id}`, date: c.start_date, title: `▶ ${c.name}`, title_ar: `▶ ${c.name}`, type: "campaign" });
        if (c.end_date >= start && c.end_date <= end)
          evts.push({ id: `ce-${c.id}`, date: c.end_date, title: `⏹ ${c.name}`, title_ar: `⏹ ${c.name}`, type: "campaign" });
        return evts;
      }),
    ...mockEnterpriseClients
      .filter(c => {
        if (!c.contract_end_date) return false;
        const cs = getContractStatus(c.contract_end_date);
        return cs.type && cs.type !== "ok" && c.contract_end_date >= start && c.contract_end_date <= end;
      })
      .map(c => ({ id: `ctr-${c.id}`, date: c.contract_end_date!, title: `📄 ${c.brand_name}`, title_ar: `📄 ${c.brand_name}`, type: "contract" as CalEventType })),
    ...SAUDI_OCCASIONS.filter(o => o.date >= start && o.date <= end),
  ];

  function eventsForDate(dateStr: string) {
    return allEvents.filter(e => e.date === dateStr && activeFilters.has(e.type));
  }

  const selectedEvents = selected ? eventsForDate(selected) : [];

  function toggleFilter(type: CalEventType) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }

  const upcomingOccasions = SAUDI_OCCASIONS
    .filter(o => o.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("calendar.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("calendar.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <button onClick={isRTL ? nextMonth : prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-base">{t(`calendar.months.${monthKeys[month]}`)} {year}</h2>
                <button onClick={goToday} className="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                  {t("calendar.today")}
                </button>
              </div>
              <button onClick={isRTL ? prevMonth : nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-border">
              {dayKeys.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                  {t(`calendar.days.${d}`)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {cells.map((cell, idx) => {
                const dayEvents = eventsForDate(cell.dateStr);
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selected;
                const isCur = cell.month === "cur";
                const hasOccasion = dayEvents.some(e => ["national","religious","marketing","holiday"].includes(e.type));
                return (
                  <div
                    key={idx}
                    onClick={() => isCur && setSelected(cell.dateStr === selected ? null : cell.dateStr)}
                    className={cn(
                      "min-h-[80px] p-1.5 border-b border-e border-border transition-colors",
                      isCur ? "cursor-pointer hover:bg-muted/40" : "bg-muted/20",
                      isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                      hasOccasion && isCur && "bg-amber-50/50 dark:bg-amber-950/10",
                      idx % 7 === 6 && "border-e-0",
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 mx-auto",
                      isToday ? "bg-primary text-white" : isCur ? "text-foreground" : "text-muted-foreground/40"
                    )}>
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => {
                        const s = TYPE_STYLES[ev.type];
                        return (
                          <div key={ev.id} className={cn("text-[9px] px-1 py-0.5 rounded truncate font-medium flex items-center gap-0.5", s.bg, s.text)}>
                            {TYPE_ICONS[ev.type] && <span className="flex-shrink-0">{TYPE_ICONS[ev.type]}</span>}
                            <span className="truncate">{isAr ? ev.title_ar : ev.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-border">
              {(Object.keys(TYPE_STYLES) as CalEventType[]).map(type => {
                const s = TYPE_STYLES[type];
                const active = activeFilters.has(type);
                return (
                  <button key={type} onClick={() => toggleFilter(type)}
                    className={cn("flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full border transition-colors",
                      active ? cn(s.bg, s.text, "border-transparent") : "border-border text-muted-foreground opacity-50"
                    )}>
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", active ? s.dot : "bg-gray-300")} />
                    {isAr ? s.label_ar : s.label_en}
                  </button>
                );
              })}
            </div>
          </div>

          {selected && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CalIcon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">{t("calendar.eventDetails")} — {new Date(selected + "T00:00:00").toLocaleDateString(isAr ? "ar-SA" : "en-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
              </div>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("calendar.noEvents") || "No events this day"}</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map(ev => {
                    const s = TYPE_STYLES[ev.type];
                    return (
                      <div key={ev.id} className={cn("flex items-start gap-3 p-3 rounded-xl", s.bg)}>
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", s.dot)} />
                        <div>
                          <p className={cn("text-sm font-medium", s.text)}>{isAr ? ev.title_ar : ev.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {isAr ? s.label_ar : s.label_en}
                            {ev.priority && ` · ${ev.priority}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">{isAr ? "المناسبات القادمة" : "Upcoming Occasions"}</h3>
            </div>
            <div className="space-y-2">
              {upcomingOccasions.map(occ => {
                const s = TYPE_STYLES[occ.type];
                const d = new Date(occ.date + "T00:00:00");
                const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
                return (
                  <div key={occ.id} className={cn("p-3 rounded-xl border border-transparent", s.bg)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={cn("text-xs font-semibold leading-snug truncate", s.text)}>{isAr ? occ.title_ar : occ.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {d.toLocaleDateString(isAr ? "ar-SA" : "en-SA", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0", s.bg, s.text)}>
                        {diff <= 0 ? (isAr ? "اليوم" : "Today") : diff === 1 ? (isAr ? "غداً" : "Tomorrow") : `${diff}${isAr ? " ي" : "d"}`}
                      </span>
                    </div>
                  </div>
                );
              })}
              {upcomingOccasions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">{isAr ? "لا توجد مناسبات قادمة" : "No upcoming occasions"}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
