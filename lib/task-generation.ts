import { prisma } from '@/lib/prisma';

export async function getOrCreateTodayTask(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if a task already exists for today
  const existingTask = await prisma.dailyTask.findUnique({
    where: {
      user_id_task_date: {
        user_id: userId,
        task_date: today,
      },
    },
    include: {
      plan: {
        include: {
          goal: true,
        },
      },
    },
  });

  if (existingTask) {
    return existingTask;
  }

  // Find the next incomplete plan for any of the user's goals
  const nextPlan = await prisma.plan.findFirst({
    where: {
      user_id: userId,
      // Find plans that don't have a completed daily task
      NOT: {
        daily_tasks: {
          some: {
            status: 'completed',
          },
        },
      },
    },
    orderBy: {
      day_number: 'asc',
    },
    include: {
      goal: true,
    },
  });

  if (!nextPlan) {
    // No incomplete plans found
    throw new Error('No plans available. Please create a goal and plan first.');
  }

  // Generate AI reason and steps (placeholder for now)
  const aiReason = `Complete this task to progress towards your goal: "${nextPlan.goal.title}"`;
  const aiSteps = `1. Review the task details\n2. Complete the required actions\n3. Mark as done when finished`;

  // Create the daily task from the plan
  const newDailyTask = await prisma.dailyTask.create({
    data: {
      user_id: userId,
      plan_id: nextPlan.id,
      goal_id: nextPlan.goal_id,
      task_date: today,
      status: 'pending',
      ai_reason: aiReason,
      ai_steps: aiSteps,
    },
    include: {
      plan: {
        include: {
          goal: true,
        },
      },
    },
  });

  return newDailyTask;
}
