'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { getStreakDataAction } from '@/app/actions/streak';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function StreakDisplay() {
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const result = await getStreakDataAction();
        if (result.success) {
          setStreak(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 items-center">
        <Skeleton className="h-16 w-32 rounded-2xl" />
        <Skeleton className="h-16 w-32 rounded-2xl" />
      </div>
    );
  }

  if (!streak) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
      {/* Current Streak */}
      <div className="relative group overflow-hidden bg-orange-500/10 dark:bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-orange-500/15">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 animate-pulse" />
          <div className="relative bg-linear-to-br from-orange-400 to-orange-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <Flame className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-orange-600 dark:text-orange-400">
              {streak.current_streak}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600/70 dark:text-orange-400/70">
              Days
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
            Current Streak
          </p>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="bg-muted/40 border border-border/40 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-muted/60">
        <div className="bg-muted p-2 rounded-xl border border-border/50">
          <Trophy className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-foreground">
              {streak.longest_streak}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Days
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
            Best Streak
          </p>
        </div>
      </div>
    </div>
  );
}
