'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getGoalAction } from '@/app/actions/goals';
import { getPlansByGoalAction } from '@/app/actions/plans';
import { getGoalsAction } from '@/app/actions/goals';
import { PlanForm } from '@/components/plan/plan-form';
import { ThirtyDayGrid } from '@/components/plan/thirty-day-grid';
import { CSVImportDialog } from '@/components/plan/csv-import-dialog';
import { Skeleton } from '@/components/ui/skeleton';

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
        <Link href="/goals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Goals
        </Link>
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No goals found. Create a goal first to start planning.</p>
            <Link href="/goals">
              <Button className="mt-4">Create a Goal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/goals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      <div className="mt-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{goal?.title}</h1>
            <p className="mt-2 text-muted-foreground">{goal?.description}</p>
          </div>
        </div>

        {goals.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {goals.map((g: any) => (
              <Button
                key={g.id}
                variant={selectedGoalId === g.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGoalId(g.id)}
              >
                {g.title}
              </Button>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <PlanForm
            goalId={selectedGoalId || ''}
            existingDays={plans.map(p => p.day_number)}
            onSuccess={() => {
              setShowForm(false);
              fetchPlans();
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-6 mt-6">
          <div className="flex justify-between items-center mb-6">
             <Skeleton className="h-8 w-48" />
             <div className="flex gap-2">
               <Skeleton className="h-10 w-28" />
               <Skeleton className="h-10 w-28" />
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">30-Day Plan</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowCSVImport(true)} variant="outline">
                Import CSV
              </Button>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Day
              </Button>
            </div>
          </div>
          <ThirtyDayGrid plans={plans} onPlansUpdate={fetchPlans} />

          <CSVImportDialog
            goalId={selectedGoalId || ''}
            open={showCSVImport}
            onOpenChange={setShowCSVImport}
            onSuccess={fetchPlans}
          />
        </>
      )}
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    }>
      <PlanPageContent />
    </Suspense>
  );
}
