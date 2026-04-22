"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/Enums/TaskStatus";
import { TaskType } from "@/lib/Enums/TaskType";

export async function getOrCreateTodayTask() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingTasks = await prisma.dailyTask.findMany({
      where: {
        user_id: userId,
        task_date: today,
      },
      include: {
        plan: { include: { goal: true } },
      },
    });

    if (existingTasks.length > 0) {
      return { success: true, data: existingTasks };
    }

    const primaryGoal = await prisma.goal.findFirst({
      where: {
        user_id: userId,
        active: true,
        plans: {
          some: {
            daily_tasks: { none: {} },
          },
        },
      },
      orderBy: {
        priority: "asc", // lower = higher priority
      },
    });

    if (!primaryGoal) {
      return { success: false, error: "All plans completed 🎉" };
    }

    const primaryPlan = await prisma.plan.findFirst({
      where: {
        user_id: userId,
        goal_id: primaryGoal.id,
        daily_tasks: { none: {} },
      },
      orderBy: {
        day_number: "asc",
      },
      include: { goal: true },
    });

    const secondaryGoal = await prisma.goal.findFirst({
      where: {
        user_id: userId,
        id: { not: primaryGoal.id },
        active: true,
        plans: {
          some: {
            daily_tasks: { none: {} },
          },
        },
      },
      orderBy: {
        priority: "asc",
      },
    });

    let secondaryPlan = null;

    if (secondaryGoal) {
      secondaryPlan = await prisma.plan.findFirst({
        where: {
          user_id: userId,
          goal_id: secondaryGoal.id,
          daily_tasks: { none: {} },
        },
        orderBy: [
          { estimated_minutes: "asc" }, // pick smallest task
          { day_number: "asc" },
        ],
        include: { goal: true },
      });
    }

    const createdTasks = await prisma.$transaction(async (tx) => {
      const tasks = [];

      // PRIMARY
      const primaryTask = await tx.dailyTask.create({
        data: {
          user_id: userId,
          plan_id: primaryPlan!.id,
          goal_id: primaryPlan!.goal_id,
          task_date: today,
          status: TaskStatus.PENDING,
          task_type: primaryPlan!.task_type,
          ai_reason: `Focus on your main goal: "${primaryPlan!.goal.title}"`,
          ai_steps: `1. Start immediately\n2. Work for ${primaryPlan!.estimated_minutes || 45} mins\n3. Mark complete`,
        },
        include: { plan: { include: { goal: true } } },
      });

      tasks.push(primaryTask);

      // SECONDARY (optional)
      if (secondaryPlan) {
        const secondaryTask = await tx.dailyTask.create({
          data: {
            user_id: userId,
            plan_id: secondaryPlan.id,
            goal_id: secondaryPlan.goal_id,
            task_date: today,
            status: TaskStatus.PENDING,
            task_type: secondaryPlan.task_type,
            is_optional: true,
            ai_reason: `Quick win for "${secondaryPlan.goal.title}"`,
            ai_steps: `1. Do this quickly\n2. Keep it light\n3. Bonus progress`,
          },
          include: { plan: { include: { goal: true } } },
        });

        tasks.push(secondaryTask);
      }

      return tasks;
    });

    return { success: true, data: createdTasks };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
