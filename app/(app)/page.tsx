'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DailyTaskCard } from '@/components/daily-task-card';
import { StreakDisplay } from '@/components/streak-display';
import { getOrCreateTodayTaskAction } from '@/app/actions/tasks';
import { TaskType } from '@/lib/Enums/TaskType';
import { TaskStatus } from '@/lib/Enums/TaskStatus';

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
          toast.error(result.error || 'Failed to load task');
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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading today&apos;s task...</p>
        </div>
      </div>
    );
  }

  if (error && dailyTasks.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-destructive bg-card p-8 text-center">
          <p className="text-destructive">{error}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Please create a goal and plan first to get started.
          </p>
        </div>
      </div>
    );
  }

  const primaryTask = dailyTasks.find((t) => t.task_type === TaskType.PRIMARY);
  const isPrimaryCompleted = primaryTask?.status === TaskStatus.COMPLETED;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        <StreakDisplay />
        {dailyTasks.length > 0 && (
          <div className="space-y-4">
            {dailyTasks
              .sort((a, b) => (a.task_type === TaskType.PRIMARY ? -1 : 1)) // primary first
              .map((task) => (
                <DailyTaskCard
                  key={task.id}
                  task={task}
                  isPrimaryCompleted={isPrimaryCompleted}
                  onTaskUpdate={() => window.location.reload()}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
