'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updatePlanAction, deletePlanAction } from '@/app/actions/plans';
import { manualTaskAction } from '@/app/actions/tasks';
import { TaskStatus } from '@/lib/Enums/TaskStatus';
import { CheckCircle2, Clock, Zap, Flame, AlignLeft, Check, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface EditPlanDialogProps {
  plan: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPlanDialog({ plan, open, onOpenChange, onSuccess }: EditPlanDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');
  const [isOptional, setIsOptional] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (plan && open) {
      resetForm();
      setIsEditMode(false);
    }
  }, [plan, open]);

  const resetForm = () => {
    if (plan) {
      setTitle(plan.title || '');
      setDescription(plan.description || '');
      setEstimatedMinutes(plan.estimated_minutes || '');
      setIsOptional(plan.is_optional || false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsEditMode(false);
      resetForm();
    }, 200);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    resetForm();
  };

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
        setIsEditMode(false);
      } else {
        toast.error(result.error || 'Failed to update plan');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;

    setIsDeleting(true);
    try {
      const result = await deletePlanAction(plan.id);
      if (result.success) {
        toast.success('Plan deleted');
        onSuccess();
        handleClose();
      } else {
        toast.error(result.error || 'Failed to delete plan');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
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
        handleClose();
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="max-w-md rounded-2xl overflow-hidden p-0 gap-0 border border-border/50 dark:border-white/20 shadow-2xl md:mx-4">
        <div className="relative p-4 sm:p-6 pb-4 bg-linear-to-br from-background to-muted/20 max-h-[90vh] overflow-y-auto">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4 sticky top-0 bg-transparent z-20">
            <div className="space-y-0.5 sm:space-y-1">
              <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/30 rounded-full px-2 sm:px-3">
                Day {plan?.day_number}
              </Badge>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight mt-1 sm:mt-2">
                {isEditMode ? 'Edit Your Plan' : 'Plan Details'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditMode ? 'Modify your plan details and save changes.' : 'View details of your 30-day plan day.'}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-1">
              {isCompleted && !isEditMode && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 mr-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Completed</span>
                </div>
              )}

              {!isEditMode ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditMode(true)}
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground h-9 w-9"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEdit}
                    className="rounded-full hover:bg-muted transition-colors text-muted-foreground h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {!isEditMode ? (
            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 p-2 rounded-xl shrink-0",
                    plan?.is_optional
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {plan?.is_optional ? <Zap className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold leading-tight">{plan?.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      {plan?.estimated_minutes && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold bg-muted/50 px-2 py-1 rounded-md">
                          <Clock className="h-3.5 w-3.5" />
                          {plan.estimated_minutes} min
                        </div>
                      )}
                      <div className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter",
                        plan?.is_optional
                          ? "text-amber-600/80 bg-amber-500/10 dark:bg-amber-500/5"
                          : "text-orange-600/80 bg-orange-500/10 dark:bg-orange-500/5"
                      )}>
                        {plan?.is_optional ? 'Bonus' : 'Main Focus'}
                      </div>
                    </div>
                  </div>
                </div>

                {plan?.description && (
                  <div className="bg-muted/30 p-4 rounded-xl border border-border/50 dark:border-white/10">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {plan.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
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
                      disabled={isLoading || isDeleting}
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
                        disabled={isLoading || isDeleting}
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
                        disabled={isLoading || isDeleting}
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
                        disabled={isLoading || isDeleting}
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
                    disabled={isLoading || isDeleting}
                    placeholder="Break down the execution steps..."
                  />
                </div>
              </div>

              <div className="pt-2">
                <DialogFooter className="flex flex-row gap-2 sm:gap-3 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isLoading || isDeleting}
                    className="flex-1 h-10 sm:h-11 rounded-xl font-bold text-[13px] sm:text-sm text-muted-foreground hover:bg-muted/50 border dark:border-white/25 px-1 sm:px-2"
                  >
                    Cancel
                  </Button>
                  {!isCompleted && (
                    <Button
                      type="button"
                      className="flex-1 h-10 sm:h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[13px] sm:text-sm shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2"
                      onClick={handleMarkAsComplete}
                      disabled={isLoading || isDeleting}
                    >
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Done
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading || isDeleting}
                    className="flex-1 h-10 sm:h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[13px] sm:text-sm shadow-lg shadow-primary/20 px-1 sm:px-2"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
