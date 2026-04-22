'use client';

import { Check, Trash2, Pencil, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deletePlanAction } from '@/app/actions/plans';
import { manualTaskAction } from '@/app/actions/tasks';
import { TaskStatus } from '@/lib/Enums/TaskStatus';
import { useState } from 'react';
import { EditPlanDialog } from './edit-plan-dialog';
import { Badge } from '@/components/ui/badge';

export interface ThirtyDayGridProps {
  plans: any[];
  onPlansUpdate: () => void;
}

export function ThirtyDayGrid({ plans, onPlansUpdate }: ThirtyDayGridProps) {
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const result = await deletePlanAction(planId);
      if (result.success) {
        toast.success('Plan deleted');
        onPlansUpdate();
      } else {
        toast.error(result.error || 'Failed to delete plan');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {days.map(day => {
        const plan = plansMap.get(day);
        const isCompleted = plan?.daily_tasks?.some((t: any) => t.status === TaskStatus.COMPLETED);

        return (
          <Card
            key={day}
            className={`relative overflow-hidden transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-muted/50'
              }`}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">Day {day}</div>
                    {isCompleted && <Check className="h-4 w-4 text-green-600 mt-1" />}
                  </div>
                  {plan && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>

                {plan ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold line-clamp-1 flex-1">{plan.title}</p>
                        <span className="text-[10px]" title={plan.is_optional ? 'Bonus Task' : 'Main Task'}>
                          {plan.is_optional ? '⚡' : '🔥'}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {plan.is_optional ? '⚡ Bonus Task' : '🔥 Main Task'}
                        </span>
                        {plan.estimated_minutes && (
                          <span className="text-[10px] text-muted-foreground">{plan.estimated_minutes} min</span>
                        )}
                      </div>

                      {/* Status and Actions */}
                      {plan.daily_tasks && plan.daily_tasks.length > 0 && (
                        <div className="pt-2 border-t mt-2 space-y-2">
                          {(() => {
                            const latestTask = [...plan.daily_tasks].sort((a, b) =>
                              new Date(b.task_date).getTime() - new Date(a.task_date).getTime()
                            )[0];

                            return (
                              <>
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant={
                                      latestTask.status === TaskStatus.COMPLETED ? 'default' :
                                        latestTask.status === TaskStatus.SKIPPED ? 'destructive' :
                                          'outline'
                                    }
                                    className="text-[9px] px-1 py-0 h-4"
                                  >
                                    {latestTask.status.toUpperCase()}
                                  </Badge>
                                </div>

                                <div className="flex gap-1">
                                  {latestTask.status === TaskStatus.SKIPPED && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-[10px] flex-1 px-1"
                                      onClick={() => handleManualAction(latestTask.id, TaskStatus.PENDING)}
                                    >
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Retry
                                    </Button>
                                  )}
                                  {latestTask.status !== TaskStatus.COMPLETED && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-[10px] flex-1 px-1"
                                      onClick={() => handleManualAction(latestTask.id, TaskStatus.COMPLETED)}
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
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
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">No plan</div>
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
