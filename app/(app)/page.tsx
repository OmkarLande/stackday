'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DailyTaskCard } from '@/components/daily-task-card';
import { StreakDisplay } from '@/components/streak-display';
import { getOrCreateTodayTaskAction } from '@/app/actions/tasks';
import { TaskType } from '@/lib/Enums/TaskType';
import { TaskStatus } from '@/lib/Enums/TaskStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Sun, Zap, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const result = await getOrCreateTodayTaskAction();
        if (result.success && Array.isArray(result.data)) {
          setDailyTasks(result.data);
          setError(null);
        } else if (!result.success) {
          setError(result.error || 'Failed to load task');
          if (result.error !== 'No active goals found') {
            toast.error(result.error || 'Failed to load task');
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, []);

  const primaryTask = dailyTasks.find((t) => t.task_type === TaskType.PRIMARY);
  const isPrimaryCompleted = primaryTask?.status === TaskStatus.COMPLETED;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12 space-y-12">
      {/* Hero Section - Renders Immediately */}
      <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-linear-to-br from-green-500/10 via-background to-primary/5 border border-border/50 shadow-sm overflow-hidden">
        <div className="absolute -right-8 -top-8 p-4 opacity-[0.03] dark:opacity-[0.05]">
          <Sun className="h-64 w-64 text-green-500" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-[0.2em]">
              <Calendar className="h-4 w-4" />
              {today}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground">
              Make it <span className="text-green-600 dark:text-green-500 italic">Count.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Focus on what matters most today. Small wins stack up to massive results.
            </p>
          </div>
          <div className="shrink-0">
            <StreakDisplay />
          </div>
        </div>
      </div>

      {/* Mission Content Section */}
      <div className="space-y-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 px-2">
          <div className="h-px flex-1 bg-border/50" />
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
            Today's Mission
          </h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-[280px] w-full rounded-[2rem]" />
            <Skeleton className="h-[180px] w-full rounded-[2rem]" />
          </div>
        ) : error && dailyTasks.length === 0 ? (
          <div className="relative p-10 rounded-[2.5rem] bg-muted/30 border border-dashed border-border/60 text-center space-y-6 overflow-hidden">
            <div className="absolute -right-8 -top-8 p-4 opacity-[0.03]">
              <Target className="h-48 w-48" />
            </div>
            <div className="relative z-10 space-y-3">
              <h2 className="text-2xl font-bold">Ready to start?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {error === 'No active goals found'
                  ? "You haven't set any goals yet. Every great achievement starts with a clear target."
                  : error}
              </p>
            </div>
            <Link href="/goals" className="inline-block relative z-10">
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600">
                Create Your First Goal
              </Button>
            </Link>
          </div>
        ) : dailyTasks.length > 0 ? (
          <div className="space-y-6">
            {dailyTasks
              .sort((a, b) => (a.task_type === TaskType.PRIMARY ? -1 : 1))
              .map((task) => (
                <div key={task.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                  <DailyTaskCard
                    task={task}
                    isPrimaryCompleted={isPrimaryCompleted}
                    onTaskUpdate={() => window.location.reload()}
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <Zap className="h-12 w-12 text-muted-foreground/20 mx-auto" />
            <p className="text-muted-foreground">No tasks scheduled for today.</p>
            <Link href="/plan">
              <Button variant="link" className="text-primary font-bold">Check your plan →</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
