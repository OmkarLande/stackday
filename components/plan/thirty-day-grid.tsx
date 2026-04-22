'use client';

import { Check, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deletePlanAction } from '@/app/actions/plans';
import { useState } from 'react';
import { EditPlanDialog } from './edit-plan-dialog';

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

  const plansMap = new Map(plans.map(p => [p.day_number, p]));
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {days.map(day => {
        const plan = plansMap.get(day);
        const isCompleted = plan && plan.daily_tasks && plan.daily_tasks.length > 0;

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
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold line-clamp-1 flex-1">{plan.title}</p>
                        <span className="text-[10px]" title={plan.task_type === 'secondary' ? 'Bonus Task' : 'Main Task'}>
                          {plan.task_type === 'secondary' ? '⚡' : '🔥'}
                        </span>
                      </div>
                      {/* description only in 2 lines */}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
                      {/* task type */}
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.task_type === 'secondary' ? '⚡ Bonus Task' : '🔥 Main Task'}
                      </p>
                      {plan.estimated_minutes && (
                        <p className="text-xs text-muted-foreground mt-1">{plan.estimated_minutes} min</p>
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
