'use server';

import { getSession } from '@/lib/auth';
import { getStreakData } from '@/lib/streak';

export async function getStreakDataAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const streak = await getStreakData(session.userId);
    return { success: true, data: streak };
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return { success: false, error: 'Failed to fetch streak data' };
  }
}
