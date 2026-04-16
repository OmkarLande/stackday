# Stackday Developer Guide

Quick reference for developing on Stackday.

## Project Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma migrate dev

# Start dev server
pnpm dev
```

Visit http://localhost:3000

## Directory Structure

```
app/
├── (app)/              # Protected routes (requires auth)
│   ├── page.tsx        # Homepage / daily task
│   ├── goals/page.tsx
│   ├── plan/page.tsx
│   ├── logs/page.tsx
│   └── layout.tsx      # Auth check wrapper
├── auth/               # Public auth routes
│   ├── login/page.tsx
│   └── register/page.tsx
├── api/                # API routes
│   └── webhooks/daily-task/route.ts
└── actions/            # Server Actions (CRUD)
    ├── auth.ts
    ├── tasks.ts
    ├── goals.ts
    ├── plans.ts
    ├── logs.ts
    ├── streak.ts
    └── import.ts

components/
├── layout/header.tsx
├── daily-task-card.tsx
├── streak-display.tsx
├── goals/
│   └── goal-form.tsx
├── plan/
│   ├── plan-form.tsx
│   ├── thirty-day-grid.tsx
│   └── csv-import-dialog.tsx
├── logs/
│   ├── log-form.tsx
│   └── log-entry.tsx
└── ui/                 # shadcn components

lib/
├── auth.ts            # JWT & sessions
├── prisma.ts          # DB client
├── types.ts           # TypeScript types
├── task-generation.ts # Core engine
├── streak.ts          # Streak logic
└── csv-parser.ts      # CSV parsing

prisma/
├── schema.prisma      # Database schema
└── migrations/        # Auto-generated migrations
```

## Common Tasks

### Add a New Page

1. Create folder: `app/(app)/new-page/`
2. Create `page.tsx`:

```tsx
'use client';
import { Button } from '@/components/ui/button';

export default function NewPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">New Page</h1>
    </div>
  );
}
```

3. Header navigation automatically picks it up

### Create a Server Action

File: `app/actions/feature.ts`

```typescript
'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function doSomethingAction(param: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    // Do something
    const result = await prisma.someTable.create({...});

    return { success: true, data: result };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Operation failed' };
  }
}
```

Use in component:
```tsx
'use client';
import { doSomethingAction } from '@/app/actions/feature';

export function MyComponent() {
  const handleClick = async () => {
    const result = await doSomethingAction('value');
    if (result.success) {
      // Handle success
    }
  };
}
```

### Update Database Schema

1. Edit `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name describe_change
   ```
3. Review and apply migration

### Add a New Component

File: `components/my-feature/my-component.tsx`

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <Card>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </Card>
  );
}
```

## Common Patterns

### Fetch Data in Page

```tsx
'use client';
import { useEffect, useState } from 'react';
import { getDataAction } from '@/app/actions/feature';

export default function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const result = await getDataAction();
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <p>Loading...</p>;
  return <div>{/* render data */}</div>;
}
```

### Form Handling

```tsx
'use client';
import { useState } from 'react';
import { submitFormAction } from '@/app/actions/feature';
import { toast } from 'sonner';

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await submitFormAction(formData);
      if (result.success) {
        toast.success('Success!');
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* fields */}</form>;
}
```

### Protected Server Action

Always check authentication first:

```typescript
export async function mySecureAction() {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check authorization (user owns resource)
  const resource = await prisma.resource.findUnique({...});
  if (resource.user_id !== session.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Proceed with operation
}
```

## Database Queries

### Find User's Data

```typescript
const tasks = await prisma.dailyTask.findMany({
  where: { user_id: session.userId },
  include: { plan: { include: { goal: true } } },
  orderBy: { task_date: 'desc' },
});
```

### Create with Relations

```typescript
const plan = await prisma.plan.create({
  data: {
    user_id: session.userId,
    goal_id: goalId,
    day_number: 1,
    title: 'Task',
    description: 'Description',
  },
});
```

### Update Safely

```typescript
// Verify ownership first
const plan = await prisma.plan.findUnique({where: {id}});
if (plan.user_id !== session.userId) throw new Error('Unauthorized');

// Then update
const updated = await prisma.plan.update({
  where: { id },
  data: { title: 'New Title' },
});
```

## UI Components

### shadcn/ui Available

All components from shadcn/ui are available in `/components/ui/`:
- Button
- Input
- Textarea
- Select
- Card
- Dialog
- Form elements
- etc.

Import and use:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

<Button onClick={handleClick}>Click Me</Button>
<Card><CardHeader>Title</CardHeader></Card>
```

### Tailwind CSS

Use Tailwind for all styling:
```tsx
<div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
  <h2 className="text-lg font-semibold">Title</h2>
  <Button size="sm">Action</Button>
</div>
```

Responsive prefixes:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
```

### Toast Notifications

```tsx
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');
toast.promise(promise, {
  loading: 'Loading...',
  success: 'Success!',
  error: 'Error!',
});
```

## Testing

### Manual Testing

1. Register new account
2. Create goal and plan
3. Complete task
4. Check streak updated
5. Create log entry
6. Test CSV import

### Browser DevTools

```javascript
// Check session in console
const response = await fetch('/api/auth/session');
const session = await response.json();
console.log(session);
```

## Debugging

### Console Logging

```typescript
// Use descriptive logs
console.log('[v0] Task generation starting for user:', userId);
console.error('[v0] Failed to fetch task:', error);
```

### Check Database

```bash
# Access Prisma Studio
npx prisma studio

# Or query directly with psql if using local PostgreSQL
psql -U user -d stackday -c "SELECT * FROM users;"
```

## Performance

### Database Indexing

Already indexed:
- user_id (all tables)
- task_date (DailyTask)
- created_at (most tables)

### Query Optimization

- Use `select` to limit fields
- Use `include` for relations
- Avoid N+1 queries
- Use `where` to filter early

## Security Checklist

- [ ] All Server Actions check `getSession()`
- [ ] Authorization verified (user owns data)
- [ ] Input validated before database operation
- [ ] No secrets in client code
- [ ] HTTPS in production
- [ ] Database backups configured
- [ ] Environment variables never logged

## Deployment

### To Vercel

```bash
git push origin main
```

Vercel auto-deploys on push.

### Environment Variables on Vercel

1. Go to Project Settings
2. Environment Variables
3. Add:
   - DATABASE_URL
   - SESSION_SECRET
   - WEBHOOK_SECRET

### Database Backups

If using Vercel Postgres:
- Automatic daily backups
- 7-day retention
- Manual backup available in dashboard

If using external database:
- Configure automated backups
- Test restore process monthly

## Useful Commands

```bash
# Development
pnpm dev                          # Start dev server
pnpm build                        # Build for production
pnpm start                        # Start production server

# Database
npx prisma migrate dev            # Create and apply migration
npx prisma migrate reset          # Reset database (loses data!)
npx prisma studio                 # Visual database browser
npx prisma db seed                # Seed database

# Code Quality
pnpm lint                         # Run ESLint
pnpm format                       # Format with Prettier (if configured)

# Utilities
npx ts-node                       # Run TypeScript directly
```

## Getting Help

1. Check relevant docs:
   - README.md - Project overview
   - N8N_SETUP.md - Webhook setup
   - IMPLEMENTATION_SUMMARY.md - Architecture details

2. Review existing code:
   - Similar Server Actions
   - Similar Components
   - Database schema

3. Check logs:
   - Browser console (client errors)
   - Terminal (server logs)
   - Vercel Dashboard (production logs)

## Quick Reference Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Happy coding!** 🚀
