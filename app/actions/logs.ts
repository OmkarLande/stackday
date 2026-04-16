'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createLogAction(date: Date, entry: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const log = await prisma.log.create({
      data: {
        user_id: session.userId,
        date,
        entry,
      },
    });

    return { success: true, data: log };
  } catch (error) {
    console.error('Error creating log:', error);
    return { success: false, error: 'Failed to create log' };
  }
}

export async function getLogsAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const logs = await prisma.log.findMany({
      where: { user_id: session.userId },
      orderBy: { date: 'desc' },
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error('Error fetching logs:', error);
    return { success: false, error: 'Failed to fetch logs' };
  }
}

export async function updateLogAction(logId: string, entry: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const log = await prisma.log.findUnique({
      where: { id: logId },
    });

    if (!log || log.user_id !== session.userId) {
      return { success: false, error: 'Log not found or unauthorized' };
    }

    const updated = await prisma.log.update({
      where: { id: logId },
      data: { entry },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating log:', error);
    return { success: false, error: 'Failed to update log' };
  }
}

export async function deleteLogAction(logId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const log = await prisma.log.findUnique({
      where: { id: logId },
    });

    if (!log || log.user_id !== session.userId) {
      return { success: false, error: 'Log not found or unauthorized' };
    }

    await prisma.log.delete({
      where: { id: logId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting log:', error);
    return { success: false, error: 'Failed to delete log' };
  }
}
