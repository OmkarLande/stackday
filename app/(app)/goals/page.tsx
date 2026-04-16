'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { GoalForm } from '@/components/goals/goal-form';
import { getGoalsAction, deleteGoalAction } from '@/app/actions/goals';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const result = await getGoalsAction();
      if (result.success) {
        setGoals(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch goals');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const result = await deleteGoalAction(goalId);
      if (result.success) {
        toast.success('Goal deleted');
        await fetchGoals();
      } else {
        toast.error(result.error || 'Failed to delete goal');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="mt-2 text-muted-foreground">
            Create goals and build 30-day plans to achieve them
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <GoalForm
            onSuccess={() => {
              setShowForm(false);
              fetchGoals();
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No goals yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal: any) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle>{goal.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/plan?goal=${goal.id}`}
                  >
                    View Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(goal.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
