'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { getStreakDataAction } from '@/app/actions/streak';

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
    return null;
  }

  if (!streak) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Flame className="h-5 w-5 text-orange-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{streak.current_streak}</div>
          <p className="text-xs text-muted-foreground mt-1">days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{streak.longest_streak}</div>
          <p className="text-xs text-muted-foreground mt-1">days</p>
        </CardContent>
      </Card>
    </div>
  );
}
