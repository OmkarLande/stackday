import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateTodayTask } from '@/lib/task-generation';

export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret
    const secret = request.headers.get('x-webhook-secret');
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get userId from request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create today's task
    const task = await getOrCreateTodayTask(userId);

    // Format response for n8n to send via WhatsApp
    const whatsappMessage = {
      to: body.phone_number || '', // Phone number should be passed in request
      message: formatTaskMessage(task, user),
      taskData: {
        id: task.id,
        title: task.plan?.title,
        reason: task.ai_reason,
        appUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://stackday.com'}/`,
      },
    };

    return NextResponse.json({
      success: true,
      data: whatsappMessage,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatTaskMessage(task: any, user: any): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stackday.com';
  const taskUrl = `${baseUrl}/?taskId=${task.id}`;

  return `
Hey ${user.name}! 🎯

Here's today's task:

*${task.plan?.title}*

${task.ai_reason ? `📌 ${task.ai_reason}` : ''}

${task.plan?.estimated_minutes ? `⏱️ Estimated time: ${task.plan.estimated_minutes} minutes` : ''}

Open Stackday to complete your task:
${taskUrl}

Keep the streak alive! 🔥
`.trim();
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Stackday Daily Task Webhook',
    status: 'active',
  });
}
