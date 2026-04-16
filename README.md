# Stackday

A deterministic single-task-per-day system that helps users stay focused on what matters most. One task per day, derived from your 30-day plan.

## What is Stackday?

Stackday is NOT another task manager. It's a decision engine that gives you ONE specific task each day. Users define a 30-day plan upfront, and the system assigns one task from that plan each day, automatically generating AI-powered reasoning and action steps.

**Key Philosophy**: Simplicity through constraint. By limiting yourself to one task per day, you eliminate decision fatigue and maintain focus.

## Core Features

- **Daily Task Generation**: Automatically assigned from your 30-day plan each day
- **One Task Per Day**: Stay focused without distractions
- **30-Day Planning**: Create structured plans for your goals
- **Streak Tracking**: Monitor your consistency with daily completion streaks
- **Goal Management**: Organize plans around meaningful goals
- **Daily Logs**: Journal your progress and reflections
- **CSV Import**: Bulk-upload 30-day plans
- **n8n/WhatsApp Integration**: Daily reminders via WhatsApp
- **AI-Generated Steps**: Get actionable reasoning and steps for each task

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Password-based (bcryptjs + JWT)
- **External**: n8n + WhatsApp API for reminders

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stackday.git
cd stackday
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```
DATABASE_URL="postgresql://user:password@localhost:5432/stackday"
SESSION_SECRET="your-random-secret-key"
WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Flow

### 1. Register/Login
- Create an account with email and password
- All data is encrypted and stored securely

### 2. Create a Goal
- Define a meaningful goal (e.g., "Learn Spanish")
- Add a description of why this goal matters

### 3. Create a 30-Day Plan
- Break your goal into 30 specific tasks
- One task per day for 30 days
- Optionally estimate time for each day
- Or bulk import from CSV

### 4. Get Your Daily Task
- Open the app each day to see today's assigned task
- The system automatically selects the next incomplete day from your plan
- Review AI-generated reasoning and action steps

### 5. Complete & Track
- Mark the task as completed or skipped
- View your current and longest streaks
- Track progress across days

### 6. Journal & Reflect
- Write daily log entries about your progress
- Reflect on challenges and victories
- Build a record of your journey

## Architecture

### Database Schema

```
User
├── Goals
│   └── Plans (30-day structure)
│       └── DailyTasks (generated executions)
├── DailyTasks (generated from Plans)
├── Logs (journal entries)
└── StreakRecord (current & longest)
```

### Key Components

- **Task Generation Engine** (`/lib/task-generation.ts`): Core logic that generates today's task from your plan
- **Server Actions** (`/app/actions/`): All data operations via Next.js Server Actions
- **Components** (`/components/`): UI organized by feature (daily-task, goals, plan, logs, etc.)

## API Endpoints

### Public Endpoints

- `POST /api/webhooks/daily-task` - Fetch today's task (for n8n/WhatsApp)
  - Header: `x-webhook-secret: your-secret`
  - Body: `{ "userId": "...", "phone_number": "+1..." }`

### Protected Endpoints (via Server Actions)

All data operations are handled through Server Actions:
- Auth: login, register, logout
- Tasks: getOrCreateTodayTask, updateDailyTaskStatus, addTaskNotes
- Goals: createGoal, getGoals, deleteGoal
- Plans: createPlan, getPlansByGoal, updatePlan, deletePlan
- Logs: createLog, getLogs, updateLog, deleteLog
- Streak: getStreakData

## CSV Import Format

Import a 30-day plan using CSV:

```csv
day_number,title,description,estimated_minutes
1,Learn basic verbs,Study common Spanish verbs,30
2,Practice pronunciation,Record yourself speaking,45
3,Quiz 1,Test your knowledge,60
```

Required columns: `day_number`, `title`
Optional columns: `description`, `estimated_minutes`

## n8n/WhatsApp Integration

Set up daily WhatsApp reminders:

1. See `N8N_SETUP.md` for detailed configuration
2. n8n calls your webhook daily at a scheduled time
3. Stackday returns today's task formatted for messaging
4. n8n sends the task via WhatsApp API

## Security

- Passwords are hashed with bcryptjs
- Sessions use secure JWT tokens in HTTP-only cookies
- Webhook requests validated with secret token
- Row-level security: users can only access their own data

## Performance

- Server-rendered pages for fast initial load
- Optimized database queries with Prisma
- CSS-in-JS with Tailwind for minimal bundle
- Incremental Static Regeneration (ISR) for dashboard

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel Settings
4. Deploy

### Self-Hosted

1. Set up PostgreSQL
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Build: `npm run build`
5. Start: `npm start`

## File Structure

```
stackday/
├── app/
│   ├── (app)/                 # Protected routes
│   │   ├── page.tsx          # Daily task homepage
│   │   ├── goals/page.tsx     # Goals management
│   │   ├── plan/page.tsx      # 30-day plan grid
│   │   └── logs/page.tsx      # Daily logs journal
│   ├── auth/                  # Auth pages
│   ├── api/                   # API routes
│   └── actions/               # Server Actions
├── components/                # React components
│   ├── daily-task-card.tsx
│   ├── goals/
│   ├── plan/
│   ├── logs/
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── auth.ts               # Authentication
│   ├── prisma.ts             # Prisma client
│   ├── task-generation.ts    # Core engine
│   ├── streak.ts             # Streak logic
│   └── csv-parser.ts         # CSV parsing
├── prisma/
│   └── schema.prisma         # Database schema
└── public/                    # Static assets
```

## Development

### Add a New Page

1. Create folder under `/app/(app)/`
2. Add `page.tsx` component
3. Add corresponding Server Actions in `/app/actions/`

### Add a New Feature

1. Update Prisma schema if needed
2. Create migration: `npx prisma migrate dev --name feature_name`
3. Create Server Actions
4. Create Components
5. Create Page

### Database Changes

1. Update `/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name change_name`
3. Review generated SQL
4. Deploy migration to production

## Troubleshooting

### Tasks not generating
- Ensure user has created a Goal
- Ensure Goal has at least one Plan with day_number
- Check browser console for errors

### Webhook failing
- Verify `WEBHOOK_SECRET` matches in n8n and `.env`
- Check server logs for errors
- Ensure database has user with matching ID

### Database migration fails
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Review migration preview: `npx prisma migrate resolve`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## License

MIT

## Support

For issues, questions, or suggestions:
1. Check documentation in `N8N_SETUP.md`
2. Review database schema in `prisma/schema.prisma`
3. Check Server Actions in `/app/actions/`

## Roadmap

- AI integration for smarter step generation
- Mobile app
- Team collaboration features
- Advanced analytics
- Habit tracking
- Community challenges
