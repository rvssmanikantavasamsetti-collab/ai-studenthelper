import type { PriorityLevel, Task } from "./types";

export function daysUntil(deadline: string): number {
  const ms = new Date(deadline).getTime() - Date.now();
  return ms / (1000 * 60 * 60 * 24);
}

const difficultyWeight = { Easy: 6, Medium: 15, Hard: 25 } as const;
const typeWeight = { Study: 0, Quiz: 4, Assignment: 5, Project: 7, Exam: 10 } as const;

export interface PriorityResult {
  score: number;
  level: PriorityLevel;
  reason: string;
}

export function computePriority(task: Task): PriorityResult {
  const days = daysUntil(task.deadline);

  // Urgency: 0-50, decaying with days remaining
  let urgency: number;
  if (days <= 0) urgency = 50;
  else if (days <= 1) urgency = 46;
  else if (days <= 2) urgency = 40;
  else if (days <= 4) urgency = 32;
  else if (days <= 7) urgency = 22;
  else if (days <= 14) urgency = 12;
  else urgency = 5;

  const difficulty = difficultyWeight[task.difficulty];
  const effort = Math.min(25, Math.round(task.hours * 4));
  const kind = typeWeight[task.type];

  const score = Math.min(100, Math.round(urgency + difficulty + effort + kind));
  const level: PriorityLevel = score >= 66 ? "High" : score >= 42 ? "Medium" : "Low";

  const when =
    days < 0
      ? "overdue"
      : days < 1
        ? "due today"
        : `due in ${Math.ceil(days)} day${Math.ceil(days) === 1 ? "" : "s"}`;

  const reason = `${when} · ${task.difficulty.toLowerCase()} difficulty · ${task.hours}h of estimated effort${
    task.type === "Exam" || task.type === "Project" ? ` · high-stakes ${task.type.toLowerCase()}` : ""
  }`;

  return { score, level, reason };
}

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => computePriority(b).score - computePriority(a).score);
}
