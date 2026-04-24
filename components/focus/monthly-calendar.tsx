"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/lib/Enums/TaskStatus";

interface MonthlyCalendarProps {
  dailyTasks: any[];
}

export function MonthlyCalendar({ dailyTasks }: MonthlyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const displayDate = new Date(currentYear, currentMonth, 1);
  const monthStart = startOfMonth(displayDate);
  const monthEnd = endOfMonth(displayDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding for start of month
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (startDayOfWeek - i));
    return d;
  });

  const allDays = [...paddingDays, ...daysInMonth];

  const getTasksForDay = (date: Date) => {
    return dailyTasks.filter(t => isSameDay(new Date(t.task_date), date));
  };

  const getDayStats = (date: Date) => {
    const tasks = getTasksForDay(date);
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const skipped = tasks.filter(t => t.status === TaskStatus.SKIPPED).length;
    return { completed, skipped, total: tasks.length, tasks };
  };

  const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <>
      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{format(displayDate, "MMMM yyyy")}</h3>
          <div className="flex gap-2">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="bg-secondary text-sm rounded-md px-2 py-1 border-none focus:ring-1 focus:ring-green-500"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {format(new Date(2000, i, 1), "MMM")}
                </option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-secondary text-sm rounded-md px-2 py-1 border-none focus:ring-1 focus:ring-green-500"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const year = today.getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground pb-2">
              {day}
            </div>
          ))}

          {allDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, displayDate);
            const isCurrentDay = isToday(day);
            const stats = getDayStats(day);

            let bgColor = "bg-secondary/30"; // 0 tasks or default
            let textColor = "text-muted-foreground";

            if (isCurrentMonth) {
              if (stats.completed >= 2) {
                bgColor = "bg-green-700 dark:bg-green-900";
                textColor = "text-white";
              } else if (stats.completed === 1 || stats.skipped > 0) {
                bgColor = "bg-green-500/80 dark:bg-green-600";
                textColor = "text-white";
              }
            }

            return (
              <button
                key={i}
                onClick={() => isCurrentMonth && setSelectedDate(day)}
                disabled={!isCurrentMonth}
                className={`
                  relative h-20 rounded-xl p-2 transition-all hover:ring-2 ring-green-500/50 flex flex-col justify-between items-start
                  ${!isCurrentMonth ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                  ${isCurrentDay ? "ring-2 ring-blue-500 bg-blue-500/10" : bgColor}
                `}
              >
                <span className={`text-sm font-medium ${isCurrentDay && !isCurrentMonth ? "text-blue-500" : textColor}`}>
                  {format(day, "d")}
                </span>

                {isCurrentMonth && (stats.completed > 0 || stats.skipped > 0) && (
                  <span className={`text-xs font-bold italic ${textColor}`}>
                    {stats.completed > 0 ? `${stats.completed} ✔` : ''}
                    {stats.completed > 0 && stats.skipped > 0 ? ' ' : ''}
                    {stats.skipped > 0 ? `${stats.skipped} ✗` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDate && format(selectedDate, "MMMM do, yyyy")}</DialogTitle>
            <DialogDescription>Your tasks for this day</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTasks.length === 0 ? (
              <p className="text-center text-muted-foreground">No tasks scheduled for this day.</p>
            ) : (
              selectedTasks.map(task => (
                <div key={task.id} className="flex flex-col gap-2 p-4 rounded-lg border bg-secondary/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{task.plan?.title || "Unknown Task"}</h4>
                      <p className="text-sm text-muted-foreground">{task.plan?.goal?.title}</p>
                    </div>
                    <Badge variant={task.status === TaskStatus.COMPLETED ? "default" : "secondary"}>
                      {task.status}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {task.task_type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
