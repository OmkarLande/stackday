'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createGoalAction(title: string, description: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const goal = await prisma.goal.create({
      data: {
        user_id: session.userId,
        title,
        description,
        active: true,
      },
    });

    return { success: true, data: goal };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { success: false, error: 'Failed to create goal' };
  }
}

export async function getGoalsAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const goals = await prisma.goal.findMany({
      where: { user_id: session.userId },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: goals };
  } catch (error) {
    console.error('Error fetching goals:', error);
    return { success: false, error: 'Failed to fetch goals' };
  }
}

export async function getGoalAction(goalId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return { success: false, error: 'Goal not found' };
    }

    if (goal.user_id !== session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    return { success: true, data: goal };
  } catch (error) {
    console.error('Error fetching goal:', error);
    return { success: false, error: 'Failed to fetch goal' };
  }
}

export async function deleteGoalAction(goalId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return { success: false, error: 'Goal not found' };
    }

    if (goal.user_id !== session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error: 'Failed to delete goal' };
  }
}
