"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDashboardDataAction } from "@/app/actions/dashboard";
import { FocusTimer } from "@/components/focus/focus-timer";
import { MonthlyCalendar } from "@/components/focus/monthly-calendar";
import { ActivityHeatmap } from "@/components/focus/activity-heatmap";
import { StatsPanel } from "@/components/focus/stats-panel";
import { TaskType } from "@/lib/Enums/TaskType";
import { isSameDay } from "date-fns";

export default function FocusDashboardPage() {
  const [data, setData] = useState<{ dailyTasks: any[]; streakRecord: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardDataAction();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || "Failed to load dashboard data");
        }
      } catch (err) {
        toast.error("An error occurred loading dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse space-y-8">
        <div className="h-64 bg-card rounded-2xl border"></div>
        <div className="h-96 bg-card rounded-2xl border"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="p-8 text-center bg-card border rounded-2xl">
          <p className="text-muted-foreground">Unable to load focus dashboard.</p>
        </div>
      </div>
    );
  }

  // Find today's primary task
  const today = new Date();
  const todaysTasks = data.dailyTasks.filter((t: any) => isSameDay(new Date(t.task_date), today));
  const primaryTask = todaysTasks.find((t: any) => t.task_type === TaskType.PRIMARY);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Focus Dashboard</h1>
        <p className="text-muted-foreground">Execute first, reflect second.</p>
      </div>

      <section>
        <FocusTimer primaryTaskTitle={primaryTask?.plan?.title} />
      </section>

      <section>
        <MonthlyCalendar dailyTasks={data.dailyTasks} />
      </section>

      <section>
        <ActivityHeatmap dailyTasks={data.dailyTasks} />
        <StatsPanel streakRecord={data.streakRecord} dailyTasks={data.dailyTasks} />
      </section>
    </div>
  );
}
