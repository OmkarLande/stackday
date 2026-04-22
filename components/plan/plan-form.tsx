'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createPlanAction } from '@/app/actions/plans';

export interface PlanFormProps {
  goalId: string;
  existingDays: number[];
  onSuccess: () => void;
}

export function PlanForm({ goalId, existingDays, onSuccess }: PlanFormProps) {
  const [dayNumber, setDayNumber] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');
  const [taskType, setTaskType] = useState<'primary' | 'secondary'>('primary');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dayNumber || dayNumber < 1 || dayNumber > 30) {
      toast.error('Day must be between 1 and 30');
      return;
    }

    if (existingDays.includes(Number(dayNumber))) {
      toast.error('This day already has a plan');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPlanAction(
        goalId,
        Number(dayNumber),
        title,
        description,
        estimatedMinutes ? Number(estimatedMinutes) : undefined,
        taskType
      );

      if (result.success) {
        toast.success('Plan created successfully');
        setDayNumber('');
        setTitle('');
        setDescription('');
        setEstimatedMinutes('');
        setTaskType('primary');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to create plan');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Plan for a Day</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="day" className="block text-sm font-medium">
                Day (1-30)
              </label>
              <Input
                id="day"
                type="number"
                min="1"
                max="30"
                placeholder="1"
                value={dayNumber}
                onChange={(e) => setDayNumber(e.target.value ? Number(e.target.value) : '')}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="minutes" className="block text-sm font-medium">
                Estimated Minutes (optional)
              </label>
              <Input
                id="minutes"
                type="number"
                min="1"
                placeholder="30"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Task Type
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={taskType === 'primary' ? 'default' : 'outline'}
                onClick={() => setTaskType('primary')}
                className="flex-1"
                disabled={isLoading}
              >
                🔥 Main
              </Button>
              <Button
                type="button"
                variant={taskType === 'secondary' ? 'default' : 'outline'}
                onClick={() => setTaskType('secondary')}
                className="flex-1"
                disabled={isLoading}
              >
                ⚡ Bonus
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Task Title
            </label>
            <Input
              id="title"
              placeholder="e.g., Learn basic verb conjugation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="What should the user do on this day?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Add to Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
