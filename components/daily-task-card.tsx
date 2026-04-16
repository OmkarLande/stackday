'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { updateDailyTaskStatusAction, addTaskNotesAction } from '@/app/actions/tasks';

export interface DailyTaskCardProps {
  task: any;
  onTaskUpdate: () => void;
}

export function DailyTaskCard({ task, onTaskUpdate }: DailyTaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const result = await updateDailyTaskStatusAction(task.id, 'completed');
      if (result.success) {
        toast.success('Task marked as completed!');
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
      const result = await updateDailyTaskStatusAction(task.id, 'skipped');
      if (result.success) {
        toast.success('Task marked as skipped');
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
        toast.success('Notes saved');
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

  const goalTitle = task.plan?.goal?.title || 'Unknown Goal';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm">
          {goalTitle}
        </div>
        <CardTitle className="text-3xl">{task.plan?.title}</CardTitle>
        <CardDescription className="mt-2">{task.plan?.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {task.ai_reason && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-semibold text-muted-foreground">Why this task?</p>
            <p className="mt-2">{task.ai_reason}</p>
          </div>
        )}

        {task.ai_steps && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-semibold text-muted-foreground">How to complete</p>
            <div className="mt-2 space-y-1 whitespace-pre-wrap text-sm">{task.ai_steps}</div>
          </div>
        )}

        {task.plan?.estimated_minutes && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-semibold text-muted-foreground">Estimated time</p>
            <p className="mt-2">{task.plan.estimated_minutes} minutes</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Your notes</label>
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your thoughts, progress, or reflections..."
                  disabled={isLoading}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setNotes(task.notes || '');
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="mt-2 cursor-pointer rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted"
                onClick={() => setIsEditing(true)}
              >
                {notes ? (
                  <p>{notes}</p>
                ) : (
                  <p>Click to add notes...</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleComplete}
            disabled={isLoading || task.status === 'completed' || task.status === 'skipped'}
          >
            <Check className="mr-2 h-5 w-5" />
            Complete
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={handleSkip}
            disabled={isLoading || task.status === 'completed' || task.status === 'skipped'}
          >
            <X className="mr-2 h-5 w-5" />
            Skip
          </Button>
        </div>

        {(task.status === 'completed' || task.status === 'skipped') && (
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm font-semibold">
              Task {task.status === 'completed' ? 'completed' : 'skipped'} ✓
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
