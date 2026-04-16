# n8n & WhatsApp Integration Setup Guide

This guide explains how to set up n8n to send daily WhatsApp reminders for Stackday tasks.

## Overview

The system works as follows:
1. n8n runs on a schedule (e.g., 8 AM daily)
2. n8n makes an HTTP POST request to your Stackday webhook endpoint
3. Stackday returns today's task formatted for WhatsApp
4. n8n sends the message via WhatsApp API

## Prerequisites

- n8n instance (cloud or self-hosted)
- WhatsApp Business Account with API access
- Deployed Stackday instance with publicly accessible webhook URL

## Step 1: Set Environment Variables

Update your `.env` file with:

```
WEBHOOK_SECRET="your-secure-secret-key"
NEXT_PUBLIC_APP_URL="https://your-stackday-domain.com"
```

## Step 2: Create n8n Workflow

### Workflow Steps:

1. **Trigger: Cron Job**
   - Schedule: Daily at 8:00 AM (or your preferred time)
   - Cron expression: `0 8 * * *`

2. **Node: HTTP Request (GET user list)**
   - Method: GET
   - URL: `https://your-stackday-domain.com/api/webhooks/users`
   - Headers:
     ```
     x-webhook-secret: [your-secret-key]
     ```
   - Purpose: Get all users to send reminders to

3. **Node: Loop (iterate users)**
   - Input: Results from GET users

4. **Node: HTTP Request (fetch today's task)**
   - Method: POST
   - URL: `https://your-stackday-domain.com/api/webhooks/daily-task`
   - Headers:
     ```
     x-webhook-secret: [your-secret-key]
     Content-Type: application/json
     ```
   - Body:
     ```json
     {
       "userId": "{{ $item(0).id }}",
       "phone_number": "{{ $item(0).phone_number }}"
     }
     ```

5. **Node: WhatsApp Notification**
   - Use official n8n WhatsApp node or webhook
   - To: `{{ $items(0)[0].data.to }}`
   - Message: `{{ $items(0)[0].data.message }}`
   - Configure with your WhatsApp Business Account credentials

## Step 3: Create Webhook Endpoint for User Fetch (Optional)

If you want to send reminders to all users, add this endpoint to your app:

```typescript
// app/api/webhooks/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 4: Store Phone Numbers in Database

To send WhatsApp messages, you'll need to:

1. Add a `phone_number` field to the User model in Prisma:
   ```prisma
   model User {
     // ... existing fields
     phone_number String? // E.164 format: +12125551234
   }
   ```

2. Create a migration:
   ```bash
   npx prisma migrate dev --name add_phone_number
   ```

3. Update user profile page to allow users to add/update their phone number

## Step 5: Test the Webhook

You can test the webhook manually:

```bash
curl -X POST https://your-stackday-domain.com/api/webhooks/daily-task \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secret-key" \
  -d '{
    "userId": "user-id-here",
    "phone_number": "+12125551234"
  }'
```

## WhatsApp API Integration

### Option A: WhatsApp Business Cloud API

Use the official WhatsApp Business API:

1. Get credentials from your WhatsApp Business Account
2. In n8n, use the official WhatsApp node
3. Configure with your API credentials

### Option B: Twilio

Simpler alternative using Twilio WhatsApp:

1. Sign up for Twilio
2. Get your Twilio phone number with WhatsApp support
3. Configure in n8n's Twilio node

## Troubleshooting

### Webhook not being called
- Verify `WEBHOOK_SECRET` matches in both Stackday and n8n
- Check n8n logs for HTTP errors
- Ensure your Stackday URL is publicly accessible

### WhatsApp message not sending
- Verify phone number is in E.164 format (+countrycode...)
- Check WhatsApp Business Account restrictions
- Verify user has opted in to receive messages

### Task not generating
- Ensure user has created at least one Goal with Plans
- Check browser console for errors on homepage

## Sample n8n Workflow JSON

You can import this workflow template into n8n (File → Import from URL or File):

```json
{
  "nodes": [
    {
      "parameters": {
        "triggerType": "cron",
        "cronExpression": "0 8 * * *"
      },
      "name": "Cron Trigger",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "https://your-stackday-domain.com/api/webhooks/users",
        "method": "GET",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-webhook-secret",
              "value": "your-secret-key"
            }
          ]
        }
      },
      "name": "HTTP Request - Get Users",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [450, 300]
    }
  ],
  "connections": {
    "Cron Trigger": {
      "main": [[{"node": "HTTP Request - Get Users", "branch": 0}]]
    }
  }
}
```

## Notes

- Tasks are generated daily at midnight UTC
- If a user completes a task, the next incomplete plan is assigned the next day
- Streaks reset if a day is skipped
- All times are stored in UTC in the database
