"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCSV, PlanCSVRow } from "@/lib/csv-parser";

export async function importPlansFromCSVAction(formData: FormData) {
  try {
    const session = await getSession();
    const file = formData.get("file") as File;
    const goalId = formData.get("goalId") as string;

    if (!file || !goalId) {
      return { success: false, error: "Missing data" };
    }
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify goal ownership
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.user_id !== session.userId) {
      return { success: false, error: "Goal not found or unauthorized" };
    }

    // Parse CSV
    const csvString = await file.text();
    let parsedRows: PlanCSVRow[];
    try {
      parsedRows = await parseCSV(csvString);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Invalid CSV format";
      return { success: false, error: errorMsg };
    }

    // Check for existing days
    const existingDays = await prisma.plan.findMany({
      where: {
        goal_id: goalId,
        day_number: {
          in: parsedRows.map((r) => r.day_number),
        },
      },
      select: { day_number: true },
    });

    if (existingDays.length > 0) {
      const conflictingDays = existingDays.map((d) => d.day_number).join(", ");
      return {
        success: false,
        error: `Days already exist: ${conflictingDays}. Please delete them first or import to a different goal.`,
      };
    }

    // Create plans
    const createdPlans = await Promise.all(
      parsedRows.map((row) =>
        prisma.plan.create({
          data: {
            user_id: session.userId,
            goal_id: goalId,
            day_number: row.day_number,
            title: row.title,
            description: row.description,
            estimated_minutes: row.estimated_minutes,
            is_optional: row.is_optional,
          },
        }),
      ),
    );

    return {
      success: true,
      data: {
        imported: createdPlans.length,
        plans: createdPlans,
      },
    };
  } catch (error) {
    console.error("Error importing plans:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Failed to import plans";
    return { success: false, error: errorMsg };
  }
}

export async function validateCSVAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }
    const text = await file.text();
    const parsedRows = await parseCSV(text);

    return {
      success: true,
      data: {
        rows: parsedRows,
        count: parsedRows.length,
      },
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Invalid CSV format";
    return { success: false, error: errorMsg };
  }
}
