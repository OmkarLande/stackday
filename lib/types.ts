// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// Goal Types
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Plan Types
export interface Plan {
  id: string;
  user_id: string;
  goal_id: string;
  day_number: number; // 1-30
  title: string;
  description?: string;
  estimated_minutes?: number;
  created_at: Date;
  updated_at: Date;
}

// DailyTask Types
export interface DailyTask {
  id: string;
  user_id: string;
  plan_id: string;
  goal_id: string;
  task_date: Date;
  status: 'pending' | 'completed' | 'skipped';
  ai_reason?: string;
  ai_steps?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Log Types
export interface Log {
  id: string;
  user_id: string;
  date: Date;
  entry: string;
  created_at: Date;
  updated_at: Date;
}

// StreakRecord Types
export interface StreakRecord {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date?: Date;
  updated_at: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Session Types
export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

// Extended DailyTask with relations
export interface DailyTaskWithRelations extends DailyTask {
  plan: Plan & {
    goal: Goal;
  };
}

// Extended Plan with relations
export interface PlanWithRelations extends Plan {
  goal: Goal;
  daily_tasks: DailyTask[];
}

// Extended Goal with relations
export interface GoalWithRelations extends Goal {
  plans: PlanWithRelations[];
}
