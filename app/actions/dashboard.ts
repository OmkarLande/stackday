"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardDataAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const dailyTasks = await prisma.dailyTask.findMany({
      where: { user_id: session.userId },
      include: { plan: true },
      orderBy: { task_date: "asc" },
    });

    const streakRecord = await prisma.streakRecord.findUnique({
      where: { user_id: session.userId },
    });

    return { success: true, data: { dailyTasks, streakRecord } };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, error: "Failed to fetch data" };
  }
}
