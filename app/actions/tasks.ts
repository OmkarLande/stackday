"use server";

import { getSession } from "@/lib/auth";
import { getOrCreateTodayTask } from "@/lib/task-generation";
import { prisma } from "@/lib/prisma";
import { updateStreakOnCompletion } from "@/lib/streak";
import { TaskStatus } from "@/lib/Enums/TaskStatus";
import { TaskType } from "@/lib/Enums/TaskType";

export async function getOrCreateTodayTaskAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const task = await getOrCreateTodayTask();
    return { success: true, data: task };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch today task";
    console.error("Error fetching today task:", error);
    return { success: false, error: errorMsg };
  }
}

export async function updateDailyTaskStatusAction(
  taskId: string,
  status: TaskStatus,
) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    if (task.user_id !== session.userId) {
      return { success: false, error: "Unauthorized" };
    }

    // prevent redundant updates
    if (task.status === status) {
      return { success: true, data: task };
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

    if (
      status === TaskStatus.COMPLETED &&
      task.task_type === TaskType.PRIMARY
    ) {
      await updateStreakOnCompletion(session.userId);
    }

    return { success: true, data: updatedTask };
  } catch (error) {
    console.error("Error updating task status:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function addTaskNotesAction(taskId: string, notes: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    if (task.user_id !== session.userId) {
      return { success: false, error: "Unauthorized" };
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
    console.error("Error adding task notes:", error);
    return { success: false, error: "Failed to add notes" };
  }
}

export async function checkPrimaryTaskCompletedAction(date: Date | string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Not authenticated" };

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const primaryTask = await prisma.dailyTask.findFirst({
      where: {
        user_id: session.userId,
        task_date: taskDate,
        task_type: TaskType.PRIMARY,
      },
    });

    return { 
      success: true, 
      completed: primaryTask?.status === TaskStatus.COMPLETED 
    };
  } catch (error) {
    console.error("Error checking primary task status:", error);
    return { success: false, error: "Failed to check status" };
  }
}
