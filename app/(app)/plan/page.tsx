'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, FileUp, Flame, Target } from 'lucide-react';
import { toast } from 'sonner';
import { getGoalAction } from '@/app/actions/goals';
import { getPlansByGoalAction } from '@/app/actions/plans';
import { getGoalsAction } from '@/app/actions/goals';
import { PlanForm } from '@/components/plan/plan-form';
import { ThirtyDayGrid } from '@/components/plan/thirty-day-grid';
import { CSVImportDialog } from '@/components/plan/csv-import-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function PlanPageContent() {
  const searchParams = useSearchParams();
  const goalId = searchParams.get('goal');

  const [goal, setGoal] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(goalId);

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (selectedGoalId) {
      fetchGoal();
      fetchPlans();
    }
  }, [selectedGoalId]);

  const fetchGoals = async () => {
    try {
      const result = await getGoalsAction();
      if (result.success) {
        setGoals(result.data || []);
        if (result.data && result.data.length > 0 && !selectedGoalId) {
          setSelectedGoalId(result.data[0].id);
        }
      } else {
        toast.error('Failed to fetch goals');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const fetchGoal = async () => {
    if (!selectedGoalId) return;
    try {
      const result = await getGoalAction(selectedGoalId);
      if (result.success) {
        setGoal(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch goal');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const fetchPlans = async () => {
    if (!selectedGoalId) return;
    try {
      setLoading(true);
      const result = await getPlansByGoalAction(selectedGoalId);
      if (result.success) {
        setPlans(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch plans');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedGoalId || goals.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/goals" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Goals
        </Link>
        <Card className="mt-8 border-dashed bg-muted/30">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
               <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No goals found</h3>
            <p className="text-muted-foreground mt-1 max-w-xs mx-auto">Create a goal first to start building your 30-day plan.</p>
            <Link href="/goals">
              <Button className="mt-6 shadow-lg shadow-primary/20">Create your first goal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <Link href="/goals" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      <div className="relative mb-12 p-6 md:p-10 rounded-[2.5rem] bg-linear-to-br from-green-500/10 via-background to-primary/5 border border-border/50 shadow-sm overflow-hidden">
        <div className="absolute -right-8 -top-8 p-4 opacity-[0.03] dark:opacity-[0.05]">
          <Flame className="h-48 w-48" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{goal?.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">{goal?.description}</p>
          </div>

          {goals.length > 1 && (
            <div className="flex gap-2 flex-wrap pt-2 border-t border-border/40">
              {goals.map((g: any) => (
                <Button
                  key={g.id}
                  variant={selectedGoalId === g.id ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "rounded-full px-4 h-8 transition-all duration-300",
                    selectedGoalId === g.id 
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => setSelectedGoalId(g.id)}
                >
                  {g.title}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="border-green-500/20 shadow-xl shadow-green-500/5">
            <CardContent className="p-6">
              <PlanForm
                goalId={selectedGoalId || ''}
                existingDays={plans.map(p => p.day_number)}
                onSuccess={() => {
                  setShowForm(false);
                  fetchPlans();
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
             <Skeleton className="h-10 w-48 rounded-lg" />
             <div className="flex gap-3">
               <Skeleton className="h-10 w-32 rounded-full" />
               <Skeleton className="h-10 w-32 rounded-full" />
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Your 30-Day Blueprint</h2>
              <p className="text-sm text-muted-foreground">Plan and track your progress day by day.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => setShowCSVImport(true)} 
                variant="outline" 
                className="rounded-full flex-1 sm:flex-none border-border/50 hover:bg-muted"
              >
                <FileUp className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="rounded-full flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 dark:bg-green-500 dark:hover:bg-green-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? 'Close Form' : 'Add Day'}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/20 pointer-events-none z-0" />
            <ThirtyDayGrid plans={plans} onPlansUpdate={fetchPlans} />
          </div>

          <CSVImportDialog
            goalId={selectedGoalId || ''}
            open={showCSVImport}
            onOpenChange={setShowCSVImport}
            onSuccess={fetchPlans}
          />
        </div>
      )}
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-12">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-24 w-full rounded-[2.5rem]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    }>
      <PlanPageContent />
    </Suspense>
  );
}
