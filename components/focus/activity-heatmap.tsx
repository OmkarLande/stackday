"use client";

import { useMemo } from "react";
import { subDays, isSameDay, format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskStatus } from "@/lib/Enums/TaskStatus";

interface ActivityHeatmapProps {
  dailyTasks: any[];
}

export function ActivityHeatmap({ dailyTasks }: ActivityHeatmapProps) {
  const days = useMemo(() => {
    const today = new Date();
    // GitHub style heatmap typically shows about a year. Let's do 364 days so it forms neat columns of 7.
    return Array.from({ length: 364 }).map((_, i) => subDays(today, 363 - i));
  }, []);

  const getDayStats = (date: Date) => {
    const tasks = dailyTasks.filter(t => isSameDay(new Date(t.task_date), date));
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const skipped = tasks.filter(t => t.status === TaskStatus.SKIPPED).length;
    return { completed, skipped };
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-6 overflow-x-auto">
      <h3 className="text-lg font-medium mb-4">Activity Heatmap</h3>
      
      <TooltipProvider delayDuration={100}>
        <div className="flex gap-1 min-w-max">
          {/* Group days by weeks to display vertically */}
          {Array.from({ length: 52 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = days[weekIndex * 7 + dayIndex];
                if (!day) return null;
                
                const stats = getDayStats(day);
                
                let bgColor = "bg-secondary/30"; // 0
                if (stats.completed === 1) {
                  bgColor = "bg-primary/40"; // 1
                } else if (stats.completed >= 2) {
                  bgColor = "bg-primary"; // 2+
                }

                return (
                  <Tooltip key={day.toISOString()}>
                    <TooltipTrigger asChild>
                      <div className={`w-3 h-3 rounded-sm ${bgColor} hover:ring-1 hover:ring-primary/50 transition-all`} />
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
      </TooltipProvider>
    </div>
  );
}
