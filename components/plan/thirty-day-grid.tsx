'use client';

import { Check, Trash2, Pencil, RotateCcw, CheckCircle2, Clock, Zap, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { manualTaskAction } from '@/app/actions/tasks';
import { TaskStatus } from '@/lib/Enums/TaskStatus';
import { useState } from 'react';
import { EditPlanDialog } from './edit-plan-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ThirtyDayGridProps {
  plans: any[];
  onPlansUpdate: () => void;
}

export function ThirtyDayGrid({ plans, onPlansUpdate }: ThirtyDayGridProps) {
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const handleManualAction = async (taskId: string, status: TaskStatus) => {
    try {
      const result = await manualTaskAction(taskId, status);
      if (result.success) {
        toast.success(`Task marked as ${status}`);
        onPlansUpdate();
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const plansMap = new Map(plans.map(p => [p.day_number, p]));
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {days.map(day => {
        const plan = plansMap.get(day);
        const isCompleted = plan?.daily_tasks?.some((t: any) => t.status === TaskStatus.COMPLETED);

        return (
          <Card
            key={day}
            onClick={() => plan ? setEditingPlan(plan) : null}
            className={cn(
              "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 dark:border-white/25",
              plan ? "bg-card cursor-pointer" : "bg-muted/30 border-dashed opacity-60",
              isCompleted && "bg-green-500/5 border-green-500/30 dark:bg-green-500/[0.02] dark:border-green-500/20"
            )}
          >
            {/* Completion Glow/Indicator */}
            {isCompleted && (
              <div className="absolute -right-4 -top-4 h-16 w-16 bg-green-500/10 blur-2xl transition-all group-hover:bg-green-500/20" />
            )}

            <CardContent className="p-3 sm:p-4 relative">
              <div className="space-y-2 sm:space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
                    plan
                      ? isCompleted
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-primary/10 text-primary dark:bg-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}>
                    Day {day}
                  </div>
                </div>

                {plan ? (
                  <div className="space-y-2 sm:space-y-3">
                    {/* Title & Type Icon */}
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "mt-0.5 p-1 rounded-md shrink-0",
                        plan.is_optional
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      )}>
                        {plan.is_optional ? <Zap className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
                      </div>
                      <h3 className={cn(
                        "text-sm font-semibold leading-snug line-clamp-2",
                        isCompleted && "text-green-700 dark:text-green-400"
                      )}>
                        {plan.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 min-h-[3rem] sm:min-h-20">
                      {plan.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3">
                      {plan.estimated_minutes && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                          <Clock className="h-3 w-3" />
                          {plan.estimated_minutes} min
                        </div>
                      )}
                      <div className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                        plan.is_optional
                          ? "text-amber-600/70 border border-amber-200 dark:border-amber-900/50"
                          : "text-orange-600/70 border border-orange-200 dark:border-orange-900/50"
                      )}>
                        {plan.is_optional ? 'Bonus' : 'Critical'}
                      </div>
                    </div>

                    {/* Task Execution Status */}
                    {plan.daily_tasks && plan.daily_tasks.length > 0 && (
                      <div className="pt-3 border-t border-border/50 space-y-2" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const latestTask = [...plan.daily_tasks].sort((a, b) =>
                            new Date(b.task_date).getTime() - new Date(a.task_date).getTime()
                          )[0];

                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] font-bold px-2 py-0 h-4 border-none uppercase tracking-widest",
                                    latestTask.status === TaskStatus.COMPLETED && "bg-green-500/10 text-green-600 dark:text-green-400",
                                    latestTask.status === TaskStatus.SKIPPED && "bg-destructive/10 text-destructive",
                                    latestTask.status === TaskStatus.PENDING && "bg-primary/10 text-primary"
                                  )}
                                >
                                  {latestTask.status}
                                </Badge>
                                {latestTask.status === TaskStatus.COMPLETED && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-1.5 pt-1">
                                {latestTask.status === TaskStatus.SKIPPED && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 sm:h-7 text-[10px] sm:text-[10px] flex-1 font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={() => handleManualAction(latestTask.id, TaskStatus.PENDING)}
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Retry
                                  </Button>
                                )}
                                {latestTask.status !== TaskStatus.COMPLETED && (
                                  <Button
                                    variant={latestTask.status === TaskStatus.PENDING ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                      "h-8 sm:h-7 text-[10px] sm:text-[10px] flex-1 font-bold transition-all",
                                      latestTask.status === TaskStatus.PENDING && "bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 border-none shadow-sm shadow-green-500/20"
                                    )}
                                    onClick={() => handleManualAction(latestTask.id, TaskStatus.COMPLETED)}
                                  >
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Done
                                  </Button>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2 space-y-2 opacity-50">
                    <div className="h-8 w-8 rounded-full border border-dashed border-muted-foreground flex items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground">Empty Slot</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <EditPlanDialog
        plan={editingPlan}
        open={!!editingPlan}
        onOpenChange={(open) => !open && setEditingPlan(null)}
        onSuccess={onPlansUpdate}
      />
    </div>
  );
}
