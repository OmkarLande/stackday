'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseCSVFile, PlanCSVRow } from '@/lib/csv-parser';

export async function importPlansFromCSVAction(
  goalId: string,
  fileBuffer: Buffer
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

    // Create a File-like object for parsing
    const blob = new Blob([fileBuffer], { type: 'text/csv' });
    const file = new File([blob], 'upload.csv', { type: 'text/csv' });

    // Parse CSV
    let parsedRows: PlanCSVRow[];
    try {
      parsedRows = await parseCSVFile(file);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Invalid CSV format';
      return { success: false, error: errorMsg };
    }

    // Check for existing days
    const existingDays = await prisma.plan.findMany({
      where: {
        goal_id: goalId,
        day_number: {
          in: parsedRows.map(r => r.day_number),
        },
      },
      select: { day_number: true },
    });

    if (existingDays.length > 0) {
      const conflictingDays = existingDays.map(d => d.day_number).join(', ');
      return {
        success: false,
        error: `Days already exist: ${conflictingDays}. Please delete them first or import to a different goal.`,
      };
    }

    // Create plans
    const createdPlans = await Promise.all(
      parsedRows.map(row =>
        prisma.plan.create({
          data: {
            user_id: session.userId,
            goal_id: goalId,
            day_number: row.day_number,
            title: row.title,
            description: row.description,
            estimated_minutes: row.estimated_minutes,
          },
        })
      )
    );

    return {
      success: true,
      data: {
        imported: createdPlans.length,
        plans: createdPlans,
      },
    };
  } catch (error) {
    console.error('Error importing plans:', error);
    const errorMsg = error instanceof Error ? error.message : 'Failed to import plans';
    return { success: false, error: errorMsg };
  }
}

export async function validateCSVAction(fileBuffer: Buffer) {
  try {
    const blob = new Blob([fileBuffer], { type: 'text/csv' });
    const file = new File([blob], 'upload.csv', { type: 'text/csv' });

    const parsedRows = await parseCSVFile(file);

    return {
      success: true,
      data: {
        rows: parsedRows,
        count: parsedRows.length,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Invalid CSV format';
    return { success: false, error: errorMsg };
  }
}
