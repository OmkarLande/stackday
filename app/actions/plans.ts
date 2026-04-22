'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaskType } from '@/lib/Enums/TaskType';

export async function createPlanAction(
  goalId: string,
  day_number: number,
  title: string,
  description: string,
  estimated_minutes?: number,
  is_optional: boolean = false
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify goal ownership
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.user_id !== session.userId) {
      return { success: false, error: 'Goal not found or unauthorized' };
    }

    const plan = await prisma.plan.create({
      data: {
        user_id: session.userId,
        goal_id: goalId,
        day_number,
        title,
        description,
        estimated_minutes,
        is_optional,
      },
    });

    return { success: true, data: plan };
  } catch (error: any) {
    console.error('Error creating plan:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Day already exists for this goal' };
    }
    return { success: false, error: 'Failed to create plan' };
  }
}

export async function getPlansByGoalAction(goalId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify goal ownership
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.user_id !== session.userId) {
      return { success: false, error: 'Goal not found or unauthorized' };
    }

    const plans = await prisma.plan.findMany({
      where: { goal_id: goalId },
      include: {
        daily_tasks: {
          where: {
            status: 'completed',
          },
        },
      },
      orderBy: { day_number: 'asc' },
    });

    return { success: true, data: plans };
  } catch (error) {
    console.error('Error fetching plans:', error);
    return { success: false, error: 'Failed to fetch plans' };
  }
}

export async function updatePlanAction(
  planId: string,
  updates: {
    title?: string;
    description?: string;
    estimated_minutes?: number;
    is_optional?: boolean;
  }
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.user_id !== session.userId) {
      return { success: false, error: 'Plan not found or unauthorized' };
    }

    const updated = await prisma.plan.update({
      where: { id: planId },
      data: updates,
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating plan:', error);
    return { success: false, error: error.message || 'Failed to update plan' };
  }
}

export async function deletePlanAction(planId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.user_id !== session.userId) {
      return { success: false, error: 'Plan not found or unauthorized' };
    }

    await prisma.plan.delete({
      where: { id: planId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting plan:', error);
    return { success: false, error: 'Failed to delete plan' };
  }
}
