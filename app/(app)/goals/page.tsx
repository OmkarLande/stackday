'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trophy, Target, Trash2, ArrowRight, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { GoalForm } from '@/components/goals/goal-form';
import { getGoalsAction, deleteGoalAction } from '@/app/actions/goals';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
      const result: any = await getGoalsAction();
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
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="relative mb-12 p-6 md:p-10 rounded-[2.5rem] bg-linear-to-br from-green-500/10 via-background to-primary/5 border border-border/50 shadow-sm overflow-hidden">
        <div className="absolute -right-8 -top-8 p-4 opacity-[0.03] dark:opacity-[0.05]">
          <Trophy className="h-48 w-48" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Your Goals</h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Define your ambitions and build structured 30-day blueprints to turn them into reality.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full h-12 px-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 dark:bg-green-500 dark:hover:bg-green-600 shrink-0"
          >
            <Plus className="mr-2 h-5 w-5" />
            {showForm ? 'Close Form' : 'New Goal'}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="border-green-500/20 shadow-xl shadow-green-500/5 overflow-hidden">
            <CardContent className="p-6">
              <GoalForm
                onSuccess={() => {
                  setShowForm(false);
                  fetchGoals();
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="py-20 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Flag className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">No goals yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-lg">Every journey begins with a single step. Create your first goal now.</p>
            <Button onClick={() => setShowForm(true)} className="mt-8 rounded-full h-11 px-8">
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {goals.map((goal: any) => (
            <Card
              key={goal.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-border/50 bg-card"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />

              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                      <Target className="h-3 w-3" />
                      Active Goal
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">{goal.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-muted-foreground line-clamp-3 leading-relaxed min-h-[4.5rem]">
                  {goal.description}
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <Link href={`/plan?goal=${goal.id}`} className="flex-1">
                    <Button
                      variant="default"
                      className="w-full rounded-full h-11 font-bold bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 shadow-md shadow-green-500/10 group/btn"
                    >
                      Manage Plan
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
