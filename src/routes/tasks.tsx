import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Shell, StatCard } from "@/components/studyflow/Shell";
import { PriorityPill, priorityRing } from "@/components/studyflow/PriorityPill";
import { computePriority, sortByPriority } from "@/lib/studyflow/priority";
import { useStats, useStudyFlow } from "@/lib/studyflow/store";
import type { Difficulty, Task, TaskType } from "@/lib/studyflow/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Manager — StudyFlow AI" },
      {
        name: "description",
        content:
          "Add, edit, complete and delete study tasks with subject, deadline, difficulty, effort and type.",
      },
      { property: "og:title", content: "Task Manager — StudyFlow AI" },
      {
        property: "og:description",
        content: "Manage every assignment, quiz, exam and project with automatic priority scoring.",
      },
    ],
  }),
  component: TasksPage,
});

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const TYPES: TaskType[] = ["Assignment", "Quiz", "Exam", "Project", "Study"];

interface FormState {
  subject: string;
  title: string;
  description: string;
  deadline: string;
  difficulty: Difficulty;
  hours: string;
  type: TaskType;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyForm(): FormState {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(17, 0, 0, 0);
  return {
    subject: "",
    title: "",
    description: "",
    deadline: toLocalInput(d.toISOString()),
    difficulty: "Medium",
    hours: "2",
    type: "Assignment",
  };
}

function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, resetSample } = useStudyFlow();
  const { completed, pending, completion } = useStats(tasks);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const visible = sortByPriority(
    tasks.filter((t) => (filter === "all" ? true : filter === "pending" ? !t.completed : t.completed)),
  );

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      subject: task.subject,
      title: task.title,
      description: task.description,
      deadline: toLocalInput(task.deadline),
      difficulty: task.difficulty,
      hours: String(task.hours),
      type: task.type,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) return;
    const payload = {
      subject: form.subject.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      deadline: new Date(form.deadline).toISOString(),
      difficulty: form.difficulty,
      hours: Math.max(0.25, Number(form.hours) || 1),
      type: form.type,
    };
    if (editingId) updateTask(editingId, payload);
    else addTask(payload);
    setForm(emptyForm());
    setEditingId(null);
    setOpen(false);
  };

  return (
    <Shell>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Task Manager</h1>
          <p className="mt-1 text-muted-foreground">
            Every assignment, quiz, exam and project — scored automatically.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pending" value={pending.length} />
          <StatCard label="Completed" value={completed.length} />
          <StatCard label="Completion" value={`${completion}%`} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
              filter === f ? "gradient-brand font-medium text-primary-foreground" : "glass-soft text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={resetSample}
            className="glass-soft rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Reset sample data
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm());
              setOpen((v) => !v);
            }}
            className="gradient-brand rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110"
          >
            {open && !editingId ? "Close" : "+ New task"}
          </button>
        </div>
      </div>

      {open && (
        <Card className="mt-4">
          <h2 className="font-display text-lg font-bold">{editingId ? "Edit task" : "New task"}</h2>
          <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">Subject</span>
              <input
                className="field mt-1"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Calculus II"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Title</span>
              <input
                className="field mt-1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Midterm exam revision"
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-muted-foreground">Description</span>
              <textarea
                className="field mt-1 min-h-20"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What exactly needs doing?"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Deadline</span>
              <input
                type="datetime-local"
                className="field mt-1"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Estimated study hours</span>
              <input
                type="number"
                step="0.25"
                min="0.25"
                className="field mt-1"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Difficulty</span>
              <select
                className="field mt-1"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Type</span>
              <select
                className="field mt-1"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="gradient-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110"
              >
                {editingId ? "Save changes" : "Add task"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setEditingId(null);
                }}
                className="glass-soft rounded-xl px-5 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-5 space-y-3">
        {visible.map((task) => {
          const p = computePriority(task);
          return (
            <div
              key={task.id}
              className={`flex flex-wrap items-start gap-4 rounded-2xl border p-4 ${priorityRing(p.level)} ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                aria-label="Toggle complete"
                className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border text-xs transition ${
                  task.completed ? "gradient-brand border-transparent text-primary-foreground" : "border-border"
                }`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`font-semibold ${task.completed ? "line-through" : ""}`}>{task.title}</p>
                  <PriorityPill level={p.level} />
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                    {task.subject}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                    {task.type}
                  </span>
                </div>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Due{" "}
                  {new Date(task.deadline).toLocaleString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {task.difficulty} · {task.hours}h
                </p>
                <p className="mt-1 text-xs text-accent">Why this rank: {p.reason} (score {p.score})</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(task)}
                  className="glass-soft rounded-lg px-3 py-1.5 text-xs transition hover:bg-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/20"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <Card>
            <p className="text-sm text-muted-foreground">No tasks here yet. Add one to get started.</p>
          </Card>
        )}
      </div>
    </Shell>
  );
}
