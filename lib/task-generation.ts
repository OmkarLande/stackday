"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/Enums/TaskStatus";
import { TaskType } from "@/lib/Enums/TaskType";

export async function getOrCreateTodayTask(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check if tasks already exist for today
    const existingTasks = await prisma.dailyTask.findMany({
      where: {
        user_id: userId,
        task_date: today,
      },
      include: {
        plan: { include: { goal: true } },
      },
      orderBy: { task_type: "asc" }, // Primary first
    });

    if (existingTasks.length > 0) {
      return { success: true, data: existingTasks };
    }

    // 2. Determine Primary Task (Carry Forward or Next Plan)
    let primaryPlan = null;

    // Check yesterday's primary task status
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayPrimary = await prisma.dailyTask.findFirst({
      where: {
        user_id: userId,
        task_date: yesterday,
        task_type: TaskType.PRIMARY,
      },
    });

    if (yesterdayPrimary && yesterdayPrimary.status !== TaskStatus.COMPLETED) {
      // CARRY FORWARD: Reuse yesterday's skipped plan
      primaryPlan = await prisma.plan.findUnique({
        where: { id: yesterdayPrimary.plan_id },
        include: { goal: true },
      });
    }

    // If no carry forward, find the next unused plan from the highest priority goal
    if (!primaryPlan) {
      const activeGoals = await prisma.goal.findMany({
        where: { user_id: userId, active: true },
        orderBy: { priority: "asc" },
      });

      for (const goal of activeGoals) {
        const nextPlan = await prisma.plan.findFirst({
          where: {
            goal_id: goal.id,
            NOT: {
              daily_tasks: {
                some: {
                  status: TaskStatus.COMPLETED,
                },
              },
            },
          },
          orderBy: [{ day_number: "asc" }],
          include: { goal: true },
        });

        if (nextPlan) {
          primaryPlan = nextPlan;
          break;
        }
      }
    }

    if (!primaryPlan) {
      return {
        success: false,
        error:
          "No primary tasks found. All remaining plans might be marked as optional!",
      };
    }

    // 3. Determine Secondary Task (Optional)
    let secondaryPlan = null;
    const otherGoals = await prisma.goal.findMany({
      where: {
        user_id: userId,
        active: true,
        id: { not: primaryPlan.goal_id },
      },
      orderBy: { priority: "asc" },
    });

    for (const goal of otherGoals) {
      // For secondary, we can pick any unused plan, but we might prefer optional ones if available
      const nextPlan = await prisma.plan.findFirst({
        where: {
          goal_id: goal.id,
          NOT: {
            daily_tasks: {
              some: {
                status: TaskStatus.COMPLETED,
              },
            },
          },
        },
        orderBy: [
          { day_number: "asc" },
          { is_optional: "desc" },
          { estimated_minutes: "asc" },
        ],
        include: { goal: true },
      });

      if (nextPlan) {
        secondaryPlan = nextPlan;
        break;
      }
    }

    // 4. Create Today's Tasks
    const createdTasks = await prisma.$transaction(async (tx) => {
      const tasks = [];

      // Create PRIMARY
      const primaryTask = await tx.dailyTask.create({
        data: {
          user_id: userId,
          plan_id: primaryPlan!.id,
          goal_id: primaryPlan!.goal_id,
          task_date: today,
          status: TaskStatus.PENDING,
          task_type: TaskType.PRIMARY,
          is_optional: primaryPlan!.is_optional,
          ai_reason: `Focus on your main goal: "${primaryPlan!.goal.title}"`,
          ai_steps: `Carry forward from yesterday if skipped\n Work for ${primaryPlan!.estimated_minutes || 45} mins\n Mark complete to maintain your streak\n Use Timer if needed`,
        },
        include: { plan: { include: { goal: true } } },
      });
      tasks.push(primaryTask);

      // Create SECONDARY if available
      if (secondaryPlan) {
        const secondaryTask = await tx.dailyTask.create({
          data: {
            user_id: userId,
            plan_id: secondaryPlan.id,
            goal_id: secondaryPlan.goal_id,
            task_date: today,
            status: TaskStatus.PENDING,
            task_type: TaskType.SECONDARY,
            is_optional: secondaryPlan.is_optional,
            ai_reason: `Quick win for "${secondaryPlan.goal.title}"`,
            ai_steps: `Bonus task\n Keep it under ${secondaryPlan.estimated_minutes || 20} mins\n Boost your productivity\n Use Timer and maintain StreakW`,
          },
          include: { plan: { include: { goal: true } } },
        });
        tasks.push(secondaryTask);
      }

      return tasks;
    });

    return { success: true, data: createdTasks };
  } catch (error) {
    console.error("Error generating tasks:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate tasks",
    };
  }
}
