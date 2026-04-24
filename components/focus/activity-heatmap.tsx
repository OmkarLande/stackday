"use client";

import { useMemo, useState } from "react";
import { subDays, isSameDay, format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskStatus } from "@/lib/Enums/TaskStatus";

interface ActivityHeatmapProps {
  dailyTasks: any[];
}

export function ActivityHeatmap({ dailyTasks }: ActivityHeatmapProps) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthsData = useMemo(() => {
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);
    const daysInYear = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      daysInYear.push(new Date(d));
    }

    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push({
        name: format(new Date(selectedYear, i, 1), "MMM"),
        days: daysInYear.filter(d => d.getMonth() === i)
      });
    }
    return months;
  }, [selectedYear]);

  const getDayStats = (date: Date) => {
    const tasks = dailyTasks.filter(t => isSameDay(new Date(t.task_date), date));
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const skipped = tasks.filter(t => t.status === TaskStatus.SKIPPED).length;
    return { completed, skipped };
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Activity Heatmap</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
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

      <div className="overflow-x-auto pb-4">
        <TooltipProvider delayDuration={100}>
          <div className="flex gap-4 min-w-max">
            {monthsData.map((month, monthIndex) => {
              // Organize days into weeks (columns)
              const weeks = [];
              let currentWeek: any[] = [];

              // Add empty spots for the first week to align days correctly (optional, but good for real calendar alignment)
              // or just pack them tightly. GitHub heatmap packs them by day of week.
              // Let's pack them by day of week.
              const firstDayOfWeek = month.days[0].getDay();
              for (let i = 0; i < firstDayOfWeek; i++) {
                currentWeek.push(null);
              }

              month.days.forEach(day => {
                currentWeek.push(day);
                if (currentWeek.length === 7) {
                  weeks.push(currentWeek);
                  currentWeek = [];
                }
              });
              if (currentWeek.length > 0) {
                // pad the rest
                while (currentWeek.length < 7) {
                  currentWeek.push(null);
                }
                weeks.push(currentWeek);
              }

              return (
                <div key={monthIndex} className="flex flex-col gap-2">
                  <span className="text-xs text-center text-muted-foreground font-medium">{month.name}</span>
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => {
                          if (!day) {
                            return <div key={`empty-${dayIndex}`} className="w-3 h-3" />;
                          }

                          const stats = getDayStats(day);

                          let bgColor = "bg-gray-300 dark:bg-gray-600"; // dark grey for not done
                          if (stats.completed >= 2) {
                            bgColor = "bg-green-700"; // dark green
                          } else if (stats.completed === 1 || stats.skipped > 0) {
                            bgColor = "bg-green-400"; // light green
                          }

                          return (
                            <Tooltip key={day.toISOString()}>
                              <TooltipTrigger asChild>
                                <div className={`w-3 h-3 rounded-sm ${bgColor} hover:ring-1 hover:ring-green-500/50 transition-all`} />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p className="font-medium">{format(day, "MMM d, yyyy")}</p>
                                  <p className="text-muted-foreground">{stats.completed} completed</p>
                                  <p className="text-muted-foreground">{stats.skipped} skipped</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
