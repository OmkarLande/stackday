'use server';

import { getSession } from '@/lib/auth';
import { getOrCreateTodayTask } from '@/lib/task-generation';
import { prisma } from '@/lib/prisma';
import { updateStreakOnCompletion } from '@/lib/streak';

export async function getOrCreateTodayTaskAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const task = await getOrCreateTodayTask(session.userId);
    return { success: true, data: task };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch today task';
    console.error('Error fetching today task:', error);
    return { success: false, error: errorMsg };
  }
}

export async function updateDailyTaskStatusAction(taskId: string, status: 'pending' | 'completed' | 'skipped') {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    if (task.user_id !== session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: { status },
      include: {
        plan: {
          include: {
            goal: true,
          },
        },
      },
    });

    // Update streak if task was completed
    if (status === 'completed') {
      await updateStreakOnCompletion(session.userId);
    }

    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function addTaskNotesAction(taskId: string, notes: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    if (task.user_id !== session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: { notes },
      include: {
        plan: {
          include: {
            goal: true,
          },
        },
      },
    });

    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Error adding task notes:', error);
    return { success: false, error: 'Failed to add notes' };
  }
}
