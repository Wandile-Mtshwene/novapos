"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { AppointmentDialog } from "@/components/appointments/appointment-dialog";
import type { AppointmentWithRelations } from "@/lib/db/queries/appointments";
import type { ServiceWithCategory } from "@/lib/db/queries/services";
import type { Staff, Customer } from "@/lib/db/schema";

type CalendarViewMode = "day" | "week" | "month";

const VIEW_LABELS: Record<CalendarViewMode, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/20 border-blue-500 text-blue-400",
  confirmed: "bg-[var(--nova-accent-dim)] border-[var(--nova-accent)] text-[var(--nova-accent)]",
  in_progress: "bg-amber-500/20 border-amber-500 text-amber-400",
  completed: "bg-emerald-500/20 border-emerald-500 text-emerald-400",
  cancelled: "bg-red-500/20 border-red-500 text-red-400",
  no_show: "bg-[var(--nova-tint-3)] border-[var(--nova-border)] text-[var(--nova-muted)]",
};

function getWeekDates(base: Date) {
  const d = new Date(base);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getAppointmentsForDay(appointments: AppointmentWithRelations[], date: Date) {
  return appointments.filter((a) => isSameDay(new Date(a.starts_at), date));
}

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  services: ServiceWithCategory[];
  staff: Staff[];
  customers: Customer[];
  compact?: boolean;
}

function AppointmentCard({ appointment, services, staff, customers, compact }: AppointmentCardProps) {
  const statusClass = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.scheduled;
  const startTime = formatTime(new Date(appointment.starts_at));
  const label = appointment.service?.name ?? "Appointment";
  const customer = appointment.customer
    ? `${appointment.customer.first_name} ${appointment.customer.last_name ?? ""}`.trim()
    : "Walk-in";

  return (
    <AppointmentDialog
      appointment={appointment}
      services={services}
      staff={staff}
      customers={customers}
    >
      <div
        className={cn(
          "w-full text-left px-2 py-1 rounded-lg border-l-2 text-[10px] leading-tight transition-all hover:brightness-110 cursor-pointer",
          statusClass
        )}
      >
        <div className="font-semibold truncate">{label}</div>
        {!compact && (
          <>
            <div className="truncate opacity-80">{customer}</div>
            <div className="opacity-60">{startTime}</div>
          </>
        )}
      </div>
    </AppointmentDialog>
  );
}

interface CalendarViewProps {
  appointments: AppointmentWithRelations[];
  services: ServiceWithCategory[];
  staff: Staff[];
  customers: Customer[];
}

export function CalendarView({ appointments, services, staff, customers }: CalendarViewProps) {
  const [view, setView] = useState<CalendarViewMode>("week");
  const [current, setCurrent] = useState(new Date());

  const weekDates = getWeekDates(current);

  function prev() {
    const d = new Date(current);
    if (view === "day") d.setDate(d.getDate() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrent(d);
  }

  function next() {
    const d = new Date(current);
    if (view === "day") d.setDate(d.getDate() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrent(d);
  }

  function goToday() {
    setCurrent(new Date());
  }

  const title =
    view === "month"
      ? `${MONTHS[current.getMonth()]} ${current.getFullYear()}`
      : view === "week"
      ? `${weekDates[0].toLocaleDateString("en-ZA", { month: "short", day: "numeric" })} - ${weekDates[6].toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" })}`
      : current.toLocaleDateString("en-ZA", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });

  function getDefaultDateStr(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Calendar toolbar */}
      <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3 border-b border-[var(--nova-border)] shrink-0 gap-2">
        <div className="flex items-center gap-1 md:gap-2 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            className="text-[var(--nova-muted)] hover:text-[var(--nova-text)] hover:bg-[var(--nova-tint-3)] shrink-0"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-xs md:text-sm font-semibold text-[var(--nova-text)] truncate text-center md:min-w-[200px]">
            {title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={next}
            className="text-[var(--nova-muted)] hover:text-[var(--nova-text)] hover:bg-[var(--nova-tint-3)] shrink-0"
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="text-xs border-[var(--nova-border)] text-[var(--nova-muted)] hover:text-[var(--nova-text)] shrink-0"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <div className="flex rounded-lg border border-[var(--nova-border)] overflow-hidden">
            {(["day", "week", "month"] as CalendarViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "text-xs px-2 py-1 md:px-3 md:py-1.5 font-medium transition-colors",
                  view === v
                    ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                    : "text-[var(--nova-muted)] hover:text-[var(--nova-text)] hover:bg-[var(--nova-tint-2)]"
                )}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>

          <AppointmentDialog
            services={services}
            staff={staff}
            customers={customers}
            defaultDate={getDefaultDateStr(current)}
          >
            <Button
              size="sm"
              className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white gap-1.5"
            >
              <Plus size={14} />
              <span className="hidden md:inline">New</span>
            </Button>
          </AppointmentDialog>
        </div>
      </div>

      {/* Week view */}
      {view === "week" && (
        <div className="flex-1 overflow-auto max-h-[calc(100dvh-200px)]">
          <div className="flex min-w-[700px]">
            {/* Time gutter */}
            <div className="w-14 shrink-0 border-r border-[var(--nova-border)]">
              <div className="h-12 border-b border-[var(--nova-border)]" />
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="h-12 md:h-16 border-b border-[var(--nova-border)] flex items-start pt-1 pr-2 justify-end"
                >
                  <span className="text-[10px] text-[var(--nova-dim)]">
                    {h % 12 === 0 ? 12 : h % 12}
                    {h < 12 ? "am" : "pm"}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((date, di) => {
              const isToday = isSameDay(date, new Date());
              const dayAppts = getAppointmentsForDay(appointments, date);

              return (
                <div
                  key={di}
                  className="min-w-[100px] flex-1 border-r border-[var(--nova-border)] last:border-r-0"
                >
                  {/* Day header */}
                  <div
                    className={cn(
                      "h-12 border-b border-[var(--nova-border)] flex flex-col items-center justify-center",
                      isToday && "bg-[var(--nova-accent-dim)]"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        isToday ? "text-[var(--nova-accent)]" : "text-[var(--nova-dim)]"
                      )}
                    >
                      {DAYS[di]}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isToday ? "text-[var(--nova-accent)]" : "text-[var(--nova-text)]"
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Hour slots with positioned appointments */}
                  <div className="relative">
                    {HOURS.map((h) => (
                      <AppointmentDialog
                        key={h}
                        services={services}
                        staff={staff}
                        customers={customers}
                        defaultDate={getDefaultDateStr(date)}
                      >
                        <div className="h-12 md:h-16 border-b border-[var(--nova-border)] hover:bg-[var(--nova-tint-1)] transition-colors cursor-pointer" />
                      </AppointmentDialog>
                    ))}

                    {/* Appointment cards overlaid */}
                    {dayAppts.map((appt) => {
                      const start = new Date(appt.starts_at);
                      const end = new Date(appt.ends_at);
                      const startHour = start.getHours() + start.getMinutes() / 60;
                      const endHour = end.getHours() + end.getMinutes() / 60;
                      const hourH = 48;
                      const top = Math.max(0, (startHour - 7) * hourH);
                      const height = Math.max(24, (endHour - startHour) * hourH);

                      return (
                        <div
                          key={appt.id}
                          className="absolute left-1 right-1 z-10"
                          style={{ top, height }}
                        >
                          <AppointmentCard
                            appointment={appt}
                            services={services}
                            staff={staff}
                            customers={customers}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day view */}
      {view === "day" && (
        <div className="flex-1 overflow-auto max-h-[calc(100dvh-200px)]">
          <div className="flex min-w-[320px]">
            <div className="w-14 shrink-0 border-r border-[var(--nova-border)]">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="h-12 md:h-16 border-b border-[var(--nova-border)] flex items-start pt-1 pr-2 justify-end"
                >
                  <span className="text-[10px] text-[var(--nova-dim)]">
                    {h % 12 === 0 ? 12 : h % 12}
                    {h < 12 ? "am" : "pm"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex-1 relative">
              {HOURS.map((h) => (
                <AppointmentDialog
                  key={h}
                  services={services}
                  staff={staff}
                  customers={customers}
                  defaultDate={getDefaultDateStr(current)}
                >
                  <div className="h-12 md:h-16 border-b border-[var(--nova-border)] hover:bg-[var(--nova-tint-1)] transition-colors cursor-pointer" />
                </AppointmentDialog>
              ))}

              {getAppointmentsForDay(appointments, current).map((appt) => {
                const start = new Date(appt.starts_at);
                const end = new Date(appt.ends_at);
                const startHour = start.getHours() + start.getMinutes() / 60;
                const endHour = end.getHours() + end.getMinutes() / 60;
                const hourH = 48;
                const top = Math.max(0, (startHour - 7) * hourH);
                const height = Math.max(24, (endHour - startHour) * hourH);

                return (
                  <div
                    key={appt.id}
                    className="absolute left-2 right-2 z-10"
                    style={{ top, height }}
                  >
                    <AppointmentCard
                      appointment={appt}
                      services={services}
                      staff={staff}
                      customers={customers}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Month view */}
      {view === "month" && (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-dim)]"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(
                current.getFullYear(),
                current.getMonth(),
                1
              ).getDay();
              const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
              const dayNum = i - adjustedFirst + 1;
              const daysInMonth = new Date(
                current.getFullYear(),
                current.getMonth() + 1,
                0
              ).getDate();
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const cellDate = new Date(
                current.getFullYear(),
                current.getMonth(),
                dayNum
              );
              const isToday = isSameDay(cellDate, new Date());
              const dayAppts = isCurrentMonth
                ? getAppointmentsForDay(appointments, cellDate)
                : [];

              return (
                <AppointmentDialog
                  key={i}
                  services={services}
                  staff={staff}
                  customers={customers}
                  defaultDate={getDefaultDateStr(cellDate)}
                >
                  <div
                    className={cn(
                      "min-h-[60px] md:min-h-[80px] rounded-xl p-2 border transition-colors cursor-pointer",
                      isCurrentMonth
                        ? "border-[var(--nova-border)] hover:border-[var(--nova-accent)]/30 hover:bg-[var(--nova-tint-1)]"
                        : "border-transparent opacity-30",
                      isToday &&
                        "border-[var(--nova-accent)]/50 bg-[var(--nova-accent-dim)]"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-semibold block mb-1",
                        isToday
                          ? "text-[var(--nova-accent)]"
                          : isCurrentMonth
                          ? "text-[var(--nova-text)]"
                          : "text-[var(--nova-dim)]"
                      )}
                    >
                      {isCurrentMonth ? dayNum : ""}
                    </span>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 3).map((appt) => (
                        <div
                          key={appt.id}
                          className={cn(
                            "text-[9px] px-1 py-0.5 rounded truncate border-l-2",
                            STATUS_COLORS[appt.status] ?? STATUS_COLORS.scheduled
                          )}
                        >
                          {appt.service?.name ?? "Appt"}
                        </div>
                      ))}
                      {dayAppts.length > 3 && (
                        <div className="text-[9px] text-[var(--nova-muted)] pl-1">
                          +{dayAppts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </AppointmentDialog>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
