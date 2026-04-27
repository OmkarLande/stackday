'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updatePlanAction } from '@/app/actions/plans';
import { manualTaskAction } from '@/app/actions/tasks';
import { TaskStatus } from '@/lib/Enums/TaskStatus';
import { CheckCircle2, Clock, Zap, Flame, AlignLeft, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface EditPlanDialogProps {
  plan: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPlanDialog({ plan, open, onOpenChange, onSuccess }: EditPlanDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');
  const [isOptional, setIsOptional] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setTitle(plan.title || '');
      setDescription(plan.description || '');
      setEstimatedMinutes(plan.estimated_minutes || '');
      setEstimatedMinutes(plan.estimated_minutes || '');
      setIsOptional(plan.is_optional || false);
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updatePlanAction(plan.id, {
        title,
        description,
        estimated_minutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
        is_optional: isOptional,
      });

      if (result.success) {
        toast.success('Plan updated successfully');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update plan');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsComplete = async () => {

    if (!plan?.daily_tasks?.[0]) return;

    setIsLoading(true);
    try {
      const latestTask = [...plan.daily_tasks].sort((a, b) =>
        new Date(b.task_date).getTime() - new Date(a.task_date).getTime()
      )[0];

      const result = await manualTaskAction(latestTask.id, TaskStatus.COMPLETED);
      if (result.success) {
        toast.success('Task marked as completed');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update task');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const latestTask = plan?.daily_tasks ? [...plan.daily_tasks].sort((a, b) =>
    new Date(b.task_date).getTime() - new Date(a.task_date).getTime()
  )[0] : null;

  const isCompleted = latestTask?.status === TaskStatus.COMPLETED;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl overflow-hidden p-0 gap-0 border border-border/50 dark:border-white/20 shadow-2xl">
        <div className="relative p-6 pb-4 bg-linear-to-br from-background to-muted/20 ">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/30 rounded-full px-3">
                Day {plan?.day_number}
              </Badge>
              <DialogTitle className="text-2xl font-black tracking-tight mt-2">
                Edit Your Plan
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/70 font-medium">
                Refine your path to consistency.
              </DialogDescription>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Completed</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Task Title */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Task Title</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    className="pl-10 h-11 bg-muted/30 border-muted/50 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:border-white/30"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="What's the main focus?"
                  />
                </div>
              </div>

              {/* Minutes & Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Duration (min)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type="number"
                      min="1"
                      className="pl-10 h-11 bg-muted/30 border-muted/50 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:border-white/30"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')}
                      disabled={isLoading}
                      placeholder="e.g. 45"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Priority</label>
                  <div className="flex gap-1 bg-muted/30 p-1 rounded-xl border border-muted/50 h-11 dark:border-white/30">
                    <button
                      type="button"
                      onClick={() => setIsOptional(false)}
                      disabled={isLoading}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold transition-all",
                        !isOptional
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <Flame className={cn("h-3 w-3", !isOptional ? "text-white" : "text-orange-500")} />
                      MAIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOptional(true)}
                      disabled={isLoading}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold transition-all",
                        isOptional
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <Zap className={cn("h-3 w-3", isOptional ? "text-white" : "text-amber-500")} />
                      BONUS
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Description</label>
                <Textarea
                  className="bg-muted/30 border-muted/50 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-none font-medium text-sm p-4 dark:border-white/30"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Break down the execution steps..."
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <DialogFooter className="flex gap-3 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 border dark:border-white/25"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                >
                  {isLoading ? 'Saving...' : 'Update Plan'}
                </Button>
              </DialogFooter>
              {/* Mark as Done Button */}
              {!isCompleted && (
                <Button
                  type="button"
                  className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black tracking-tight shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  onClick={handleMarkAsComplete}
                  disabled={isLoading}
                >
                  <Check className="h-5 w-5" />
                  MARK AS DONE
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
