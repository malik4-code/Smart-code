import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

interface CalEvent {
  id: string;
  date: string;
  title: string;
  type: "task" | "project";
  priority?: string;
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { fetchEvents(); }, [current]);

  async function fetchEvents() {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    const start = new Date(current.getFullYear(), current.getMonth(), 1).toISOString().split("T")[0];
    const end = new Date(current.getFullYear(), current.getMonth() + 1, 0).toISOString().split("T")[0];

    const [tasks, projects] = await Promise.all([
      supabase.from("tasks").select("id, title, due_date, priority")
        .not("due_date", "is", null).gte("due_date", start).lte("due_date", end)
        .neq("status", "cancelled"),
      supabase.from("projects").select("id, name, end_date")
        .not("end_date", "is", null).gte("end_date", start).lte("end_date", end)
        .neq("status", "cancelled"),
    ]);

    const taskEvents: CalEvent[] = (tasks.data || []).map((t: any) => ({
      id: t.id, date: t.due_date, title: t.title, type: "task", priority: t.priority,
    }));
    const projectEvents: CalEvent[] = (projects.data || []).map((p: any) => ({
      id: p.id, date: p.end_date, title: p.name, type: "project",
    }));

    setEvents([...taskEvents, ...projectEvents]);
    setLoading(false);
  }

  function prevMonth() { setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1)); }
  function nextMonth() { setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1)); }
  function goToday() { setCurrent(new Date(today.getFullYear(), today.getMonth(), 1)); }

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const monthKeys = ["january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"];
  const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  const cells: { day: number; month: "prev" | "cur" | "next"; dateStr: string }[] = [];
  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrev - firstDay + 1 + i;
    const mm = month === 0 ? 12 : month;
    const yy = month === 0 ? year - 1 : year;
    cells.push({ day: d, month: "prev", dateStr: `${yy}-${String(mm).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: "cur", dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const mm = month === 11 ? 1 : month + 2;
    const yy = month === 11 ? year + 1 : year;
    cells.push({ day: d, month: "next", dateStr: `${yy}-${String(mm).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function eventsForDate(dateStr: string) {
    return events.filter(e => e.date === dateStr);
  }

  const selectedEvents = selected ? eventsForDate(selected) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("calendar.title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("calendar.subtitle")}</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button onClick={isRTL ? nextMonth : prevMonth}
            className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-base">
              {t(`calendar.months.${monthKeys[month]}`)} {year}
            </h2>
            <button onClick={goToday} className="px-3 py-1 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
              {t("calendar.today")}
            </button>
          </div>
          <button onClick={isRTL ? prevMonth : nextMonth}
            className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {dayKeys.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
              {t(`calendar.days.${d}`)}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayEvents = eventsForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selected;
            const isCur = cell.month === "cur";
            return (
              <div
                key={idx}
                onClick={() => isCur && setSelected(cell.dateStr === selected ? null : cell.dateStr)}
                className={cn(
                  "min-h-[88px] p-2 border-b border-e border-border transition-colors",
                  isCur ? "cursor-pointer hover:bg-muted/40" : "bg-muted/20",
                  isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                  idx % 7 === 6 && "border-e-0",
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1 mx-auto",
                  isToday ? "bg-primary text-white" : isCur ? "text-foreground" : "text-muted-foreground/40"
                )}>
                  {cell.day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded truncate font-medium",
                      ev.type === "task" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                    )}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-muted-foreground px-1.5">+{dayEvents.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-200" />
            {t("calendar.taskDue")}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-200" />
            {t("calendar.projectDeadline")}
          </div>
        </div>
      </div>

      {/* Selected day events */}
      {selected && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalIcon className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">{t("calendar.eventDetails")} — {selected}</h3>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("calendar.noEvents")}</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(ev => (
                <div key={ev.id} className={cn(
                  "flex items-start gap-3 p-3 rounded-lg",
                  ev.type === "task" ? "bg-blue-50 dark:bg-blue-950/20" : "bg-orange-50 dark:bg-orange-950/20"
                )}>
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                    ev.type === "task" ? "bg-blue-500" : "bg-orange-500"
                  )} />
                  <div>
                    <p className="text-sm font-medium">{ev.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {ev.type === "task" ? t("calendar.taskDue") : t("calendar.projectDeadline")}
                      {ev.priority && ` · ${t(`tasks.priorities.${ev.priority}`)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
