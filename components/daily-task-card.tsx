'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Clock, Flame, Zap, MessageSquare, Save, ChevronRight, CheckCircle2, Plus } from 'lucide-react';
import { updateDailyTaskStatusAction, addTaskNotesAction } from '@/app/actions/tasks';
import { TaskType } from '@/lib/Enums/TaskType';
import { TaskStatus } from '@/lib/Enums/TaskStatus';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface DailyTaskCardProps {
  task: any;
  isPrimaryCompleted?: boolean;
  onTaskUpdate: () => void;
}

export function DailyTaskCard({ task, isPrimaryCompleted, onTaskUpdate }: DailyTaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    if (task.task_type === TaskType.SECONDARY && !isPrimaryCompleted) {
      toast.error('Complete your main task first! 🔥');
      setIsLoading(false);
      return;
    }
    try {
      const result = await updateDailyTaskStatusAction(task.id, TaskStatus.COMPLETED);
      if (result.success) {
        toast.success('Victory! Task completed! 🏆');
        onTaskUpdate();
      } else {
        toast.error(result.error || 'Failed to update task');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const result = await updateDailyTaskStatusAction(task.id, TaskStatus.SKIPPED);
      if (result.success) {
        toast.success('Task skipped for now');
        onTaskUpdate();
      } else {
        toast.error(result.error || 'Failed to update task');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsLoading(true);
    try {
      const result = await addTaskNotesAction(task.id, notes);
      if (result.success) {
        toast.success('Reflection saved successfully');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to save notes');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isSkipped = task.status === TaskStatus.SKIPPED;
  const goalTitle = task.plan?.goal?.title || 'Personal';

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 border-border/50",
        task.task_type === TaskType.PRIMARY
          ? "shadow-xl shadow-primary/5 dark:shadow-primary/10"
          : "bg-muted/30 border-dashed opacity-90",
        isCompleted && "bg-green-500/[0.03] border-green-500/30 dark:border-green-500/20"
      )}
    >
      {/* Decorative gradient for primary task */}
      {task.task_type === TaskType.PRIMARY && !isCompleted && (
        <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-orange-500 to-primary" />
      )}

      {isCompleted && (
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
      )}

      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {goalTitle}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  task.task_type === TaskType.PRIMARY
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/50"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                )}
              >
                {task.task_type === TaskType.PRIMARY ? (
                  <><Flame className="h-3 w-3 mr-1" /> Main Focus</>
                ) : (
                  <><Zap className="h-3 w-3 mr-1" /> Bonus Task</>
                )}
              </Badge>
              {task.is_optional && (
                <span className="text-[10px] text-muted-foreground font-medium italic">Optional Step</span>
              )}
            </div>

            <div className="space-y-2">
              <h2 className={cn(
                "text-3xl font-extrabold tracking-tight",
                isCompleted && "text-green-700 dark:text-green-400 line-through opacity-70"
              )}>
                {task.plan?.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {task.plan?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.plan?.estimated_minutes && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/40 text-xs font-semibold text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {task.plan.estimated_minutes}m
              </div>
            )}
            {isCompleted && <CheckCircle2 className="h-8 w-8 text-green-500 animate-in zoom-in duration-300" />}
          </div>
        </div>

        {/* AI Guidance Sections */}
        {(task.ai_reason || task.ai_steps) && !isCompleted && !isSkipped && (
          <div className="grid md:grid-cols-2 gap-4">
            {task.ai_reason && (
              <div className="group rounded-[1.25rem] bg-muted/40 p-4 border border-border/20 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-primary/10 text-primary">
                    <Flame className="h-3 w-3" />
                  </div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">The "Why"</p>
                </div>
                <p className="text-sm leading-relaxed">{task.ai_reason}</p>
              </div>
            )}

            {task.ai_steps && (
              <div className="group rounded-[1.25rem] bg-muted/40 p-4 border border-border/20 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-md bg-primary/10 text-primary">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Action Steps</p>
                </div>
                <div className="space-y-1.5">
                  {task.ai_steps.split('\n').map((step: string, i: number) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reflection / Notes Area */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Reflection</h4>
          </div>

          {isEditing ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it go? What did you learn?"
                className="min-h-[100px] rounded-2xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all resize-none p-4"
                disabled={isLoading}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setNotes(task.notes || '');
                  }}
                  className="rounded-full"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="rounded-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save reflection
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "group relative cursor-pointer rounded-2xl border border-dashed p-5 transition-all",
                notes ? "bg-muted/10 border-border/40 hover:border-primary/30" : "bg-muted/5 border-border/20 hover:bg-muted/10 hover:border-border/40"
              )}
              onClick={() => setIsEditing(true)}
            >
              {notes ? (
                <p className="text-sm leading-relaxed italic text-foreground/80">"{notes}"</p>
              ) : (
                <div className="flex items-center justify-between text-muted-foreground/60">
                  <p className="text-sm">Click to add a reflection or notes for today...</p>
                  <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Final Actions */}
        {!isCompleted && !isSkipped ? (
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/40">
            <Button
              size="lg"
              className={cn(
                "flex-1 h-14 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-[0.98]",
                task.task_type === TaskType.PRIMARY
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20"
                  : "bg-primary/90 hover:bg-primary"
              )}
              onClick={handleComplete}
              disabled={isLoading || (task.task_type === TaskType.SECONDARY && !isPrimaryCompleted)}
            >
              <Check className="mr-2 h-6 w-6 stroke-[3]" />
              {task.task_type === TaskType.PRIMARY ? 'Complete Main Focus' : 'Finish Bonus Task'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-14 rounded-2xl text-base font-bold border-border/50 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
              onClick={handleSkip}
              disabled={isLoading}
            >
              <X className="mr-2 h-6 w-6" />
              Skip for now
            </Button>
          </div>
        ) : (
          <div className={cn(
            "rounded-2xl p-4 flex items-center justify-center gap-3 animate-in slide-in-from-bottom-2",
            isCompleted ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
          )}>
            <div className={cn(
              "p-1 rounded-full",
              isCompleted ? "bg-green-500/20" : "bg-muted-foreground/20"
            )}>
              {isCompleted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">
              {isCompleted ? 'Mission Accomplished' : 'Task Skipped'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
