import { computePriority, sortByPriority } from "./priority";
import type { StudySession, Task } from "./types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmt(h: number, m: number) {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export interface PlanResult {
  sessions: StudySession[];
  allocated: number;
  unscheduled: string[];
  summary: string;
}

/**
 * Splits available hours across pending tasks, most urgent first,
 * in blocks of at most 2 hours spread over the coming week.
 */
export function buildStudyPlan(tasks: Task[], availableHours: number, days = 7): PlanResult {
  const pending = sortByPriority(tasks.filter((t) => !t.completed));
  const perDay = Math.max(1, availableHours / days);

  const sessions: StudySession[] = [];
  const unscheduled: string[] = [];

  let remainingTotal = availableHours;
  let dayIndex = 0;
  let dayUsed = 0;
  let cursor = 16; // start studying at 16:00

  const nextDay = () => {
    dayIndex += 1;
    dayUsed = 0;
    cursor = 16;
  };

  for (const task of pending) {
    let need = task.hours;
    if (remainingTotal <= 0.25) {
      unscheduled.push(task.title);
      continue;
    }
    while (need > 0.25 && remainingTotal > 0.25 && dayIndex < days) {
      if (dayUsed >= perDay - 0.25) {
        nextDay();
        if (dayIndex >= days) break;
      }
      const block = Math.min(2, need, remainingTotal, perDay - dayUsed);
      if (block < 0.25) {
        nextDay();
        continue;
      }
      const date = new Date();
      date.setDate(date.getDate() + dayIndex);

      const startH = Math.floor(cursor);
      const startM = Math.round((cursor - startH) * 60);
      const endRaw = cursor + block;
      const endH = Math.floor(endRaw);
      const endM = Math.round((endRaw - endH) * 60);

      sessions.push({
        id: `${task.id}-${dayIndex}-${sessions.length}`,
        taskId: task.id,
        title: task.title,
        subject: task.subject,
        day: DAY_LABELS[date.getDay()],
        date: date.toISOString(),
        start: fmt(startH, startM),
        end: fmt(endH, endM),
        hours: Math.round(block * 100) / 100,
      });

      need -= block;
      remainingTotal -= block;
      dayUsed += block;
      cursor = endRaw + 0.25; // short break
    }
    if (need > 0.25) unscheduled.push(task.title);
  }

  const allocated = Math.round((availableHours - remainingTotal) * 100) / 100;
  const top = pending[0];
  const summary = top
    ? `Scheduled ${allocated}h across ${sessions.length} focused sessions. Start with ${top.subject} — ${computePriority(top).reason}.`
    : "Nothing pending. Add a task to generate a schedule.";

  return { sessions, allocated, unscheduled, summary };
}
