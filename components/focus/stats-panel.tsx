"use client";

import { Flame, Trophy, CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { TaskStatus } from "@/lib/Enums/TaskStatus";
import { isSameDay } from "date-fns";

interface StatsPanelProps {
  streakRecord: any;
  dailyTasks: any[];
}

export function StatsPanel({ streakRecord, dailyTasks }: StatsPanelProps) {
  const totalActiveDays = useMemo(() => {
    const completedTasks = dailyTasks.filter(t => t.status === TaskStatus.COMPLETED);
    // Unique days where at least one task was completed
    const activeDates = new Set(completedTasks.map(t => new Date(t.task_date).toDateString()));
    return activeDates.size;
  }, [dailyTasks]);

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="bg-card rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-center text-center">
        <CalendarDays className="h-6 w-6 text-blue-500 mb-2" />
        <span className="text-2xl font-bold">{totalActiveDays}</span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Days</span>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-center text-center">
        <Flame className="h-6 w-6 text-orange-500 mb-2" />
        <span className="text-2xl font-bold">{streakRecord?.current_streak || 0}</span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Streak</span>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-4 flex flex-col items-center justify-center text-center">
        <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
        <span className="text-2xl font-bold">{streakRecord?.longest_streak || 0}</span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Longest Streak</span>
      </div>
    </div>
  );
}
