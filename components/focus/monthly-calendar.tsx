"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/lib/Enums/TaskStatus";

interface MonthlyCalendarProps {
  dailyTasks: any[];
}

export function MonthlyCalendar({ dailyTasks }: MonthlyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding for start of month
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (startDayOfWeek - i));
    return d;
  });

  const allDays = [...paddingDays, ...daysInMonth];

  const getTasksForDay = (date: Date) => {
    return dailyTasks.filter(t => isSameDay(new Date(t.task_date), date));
  };

  const getDayStats = (date: Date) => {
    const tasks = getTasksForDay(date);
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    return { completed, total: tasks.length, tasks };
  };

  const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <>
      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">{format(today, "MMMM yyyy")}</h3>
        
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground pb-2">
              {day}
            </div>
          ))}
          
          {allDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, today);
            const isCurrentDay = isToday(day);
            const stats = getDayStats(day);
            
            let bgColor = "bg-secondary/30"; // 0 tasks or default
            let textColor = "text-muted-foreground";
            
            if (isCurrentMonth) {
              if (stats.completed === 1) {
                bgColor = "bg-primary/40";
                textColor = "text-primary-foreground";
              } else if (stats.completed >= 2) {
                bgColor = "bg-primary";
                textColor = "text-primary-foreground";
              }
            }

            return (
              <button
                key={i}
                onClick={() => isCurrentMonth && setSelectedDate(day)}
                disabled={!isCurrentMonth}
                className={`
                  relative h-20 rounded-xl p-2 transition-all hover:ring-2 ring-primary/50 flex flex-col justify-between items-start
                  ${!isCurrentMonth ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                  ${isCurrentDay ? "ring-2 ring-blue-500 bg-blue-500/10" : bgColor}
                `}
              >
                <span className={`text-sm font-medium ${isCurrentDay ? "text-blue-500" : textColor}`}>
                  {format(day, "d")}
                </span>
                
                {isCurrentMonth && stats.completed > 0 && (
                  <span className={`text-xs font-bold ${textColor}`}>
                    {stats.completed} ✔
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDate && format(selectedDate, "MMMM do, yyyy")}</DialogTitle>
            <DialogDescription>Your tasks for this day</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTasks.length === 0 ? (
              <p className="text-center text-muted-foreground">No tasks scheduled for this day.</p>
            ) : (
              selectedTasks.map(task => (
                <div key={task.id} className="flex flex-col gap-2 p-4 rounded-lg border bg-secondary/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{task.plan?.title || "Unknown Task"}</h4>
                      <p className="text-sm text-muted-foreground">{task.plan?.goal?.title}</p>
                    </div>
                    <Badge variant={task.status === TaskStatus.COMPLETED ? "default" : "secondary"}>
                      {task.status}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {task.task_type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
