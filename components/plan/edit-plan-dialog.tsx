'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updatePlanAction } from '@/app/actions/plans';

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
  const [taskType, setTaskType] = useState<'primary' | 'secondary'>('primary');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setTitle(plan.title || '');
      setDescription(plan.description || '');
      setEstimatedMinutes(plan.estimated_minutes || '');
      setTaskType(plan.task_type || 'primary');
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
        task_type: taskType,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Plan - Day {plan?.day_number}</DialogTitle>
          <DialogDescription>
            Update the details for this day's task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minutes</label>
              <Input
                type="number"
                min="1"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={taskType === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskType('primary')}
                  className="flex-1 px-1 h-9"
                  disabled={isLoading}
                >
                  🔥 Main
                </Button>
                <Button
                  type="button"
                  variant={taskType === 'secondary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskType('secondary')}
                  className="flex-1 px-1 h-9"
                  disabled={isLoading}
                >
                  ⚡ Bonus
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
