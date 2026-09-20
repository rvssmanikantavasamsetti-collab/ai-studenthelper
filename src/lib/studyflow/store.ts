import { useCallback, useEffect, useState } from "react";
import { SAMPLE_TASKS } from "./sample-data";
import type { QuizAttempt, Task } from "./types";

const TASKS_KEY = "studyflow.tasks.v1";
const ATTEMPTS_KEY = "studyflow.attempts.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

const listeners = new Set<() => void>();
function broadcast() {
  listeners.forEach((l) => l());
}

export function useStudyFlow() {
  const [hydrated, setHydrated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const sync = useCallback(() => {
    setTasks(read<Task[]>(TASKS_KEY, SAMPLE_TASKS));
    setAttempts(read<QuizAttempt[]>(ATTEMPTS_KEY, []));
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(TASKS_KEY);
    if (!stored) write(TASKS_KEY, SAMPLE_TASKS);
    sync();
    setHydrated(true);
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [sync]);

  const persist = useCallback((next: Task[]) => {
    write(TASKS_KEY, next);
    setTasks(next);
    broadcast();
  }, []);

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt" | "completed"> & { completed?: boolean }) => {
      const next: Task = {
        ...task,
        completed: task.completed ?? false,
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      persist([next, ...read<Task[]>(TASKS_KEY, tasks)]);
    },
    [persist, tasks],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      persist(read<Task[]>(TASKS_KEY, tasks).map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    [persist, tasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      persist(read<Task[]>(TASKS_KEY, tasks).filter((t) => t.id !== id));
    },
    [persist, tasks],
  );

  const toggleTask = useCallback(
    (id: string) => {
      persist(
        read<Task[]>(TASKS_KEY, tasks).map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    },
    [persist, tasks],
  );

  const addAttempt = useCallback((attempt: QuizAttempt) => {
    const next = [attempt, ...read<QuizAttempt[]>(ATTEMPTS_KEY, [])].slice(0, 20);
    write(ATTEMPTS_KEY, next);
    setAttempts(next);
    broadcast();
  }, []);

  const resetSample = useCallback(() => {
    persist(SAMPLE_TASKS);
  }, [persist]);

  return { hydrated, tasks, attempts, addTask, updateTask, deleteTask, toggleTask, addAttempt, resetSample };
}

export function useStats(tasks: Task[]) {
  const completed = tasks.filter((t) => t.completed);
  const pending = tasks.filter((t) => !t.completed);
  const completion = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  const studyHours = Math.round(completed.reduce((s, t) => s + t.hours, 0) * 10) / 10;
  const plannedHours = Math.round(pending.reduce((s, t) => s + t.hours, 0) * 10) / 10;

  const subjects = Array.from(new Set(tasks.map((t) => t.subject))).map((subject) => {
    const all = tasks.filter((t) => t.subject === subject);
    const done = all.filter((t) => t.completed);
    return {
      subject,
      total: all.length,
      done: done.length,
      hours: Math.round(done.reduce((s, t) => s + t.hours, 0) * 10) / 10,
      percent: all.length ? Math.round((done.length / all.length) * 100) : 0,
    };
  });

  return { completed, pending, completion, studyHours, plannedHours, subjects };
}
