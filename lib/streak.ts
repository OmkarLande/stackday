import { prisma } from '@/lib/prisma';

export async function updateStreakOnCompletion(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streakRecord.findUnique({
      where: { user_id: userId },
    });

    if (!streak) {
      // Create streak record if it doesn't exist
      return await prisma.streakRecord.create({
        data: {
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_completed_date: today,
        },
      });
    }

    const lastCompletedDate = streak.last_completed_date
      ? new Date(streak.last_completed_date)
      : null;

    if (lastCompletedDate) {
      lastCompletedDate.setHours(0, 0, 0, 0);
    }

    // Check if the user completed a task yesterday or today
    let newCurrentStreak = 1;

    if (lastCompletedDate) {
      const daysDifference = Math.floor(
        (today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If completed today (same day), don't increment
      if (daysDifference === 0) {
        newCurrentStreak = streak.current_streak;
      }
      // If completed yesterday, increment
      else if (daysDifference === 1) {
        newCurrentStreak = streak.current_streak + 1;
      }
      // If more than 1 day difference, reset to 1
      else {
        newCurrentStreak = 1;
      }
    }

    const newLongestStreak = Math.max(newCurrentStreak, streak.longest_streak);

    return await prisma.streakRecord.update({
      where: { user_id: userId },
      data: {
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_completed_date: today,
      },
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

export async function getStreakData(userId: string) {
  try {
    const streak = await prisma.streakRecord.findUnique({
      where: { user_id: userId },
    });

    if (!streak) {
      return { user_id: userId, current_streak: 0, longest_streak: 0, last_completed_date: null };
    }

    // Check if the streak is broken
    if (streak.last_completed_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastCompletedDate = new Date(streak.last_completed_date);
      lastCompletedDate.setHours(0, 0, 0, 0);

      const daysDifference = Math.floor(
        (today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If more than 1 day difference, the streak is broken
      if (daysDifference > 1) {
        return {
          ...streak,
          current_streak: 0,
        };
      }
    }

    return streak;
  } catch (error) {
    console.error('Error fetching streak data:', error);
    throw error;
  }
}

