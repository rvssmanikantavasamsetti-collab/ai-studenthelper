import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, ProgressBar, Shell, StatCard } from "@/components/studyflow/Shell";
import { PriorityPill, priorityBadge, priorityRing } from "@/components/studyflow/PriorityPill";
import { computePriority, daysUntil, sortByPriority } from "@/lib/studyflow/priority";
import { useStats, useStudyFlow } from "@/lib/studyflow/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyFlow AI" },
      {
        name: "description",
        content:
          "See today's study plan, upcoming deadlines, completion rate and study hours in one intelligent dashboard.",
      },
      { property: "og:title", content: "Dashboard — StudyFlow AI" },
      {
        property: "og:description",
        content: "Today's study plan, deadlines and progress, ranked by a smart priority engine.",
      },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const { tasks, toggleTask } = useStudyFlow();
  const { completed, pending, completion, studyHours, subjects } = useStats(tasks);
  const ranked = sortByPriority(pending);
  const today = ranked.filter((t) => daysUntil(t.deadline) <= 2).slice(0, 4);
  const plan = today.length ? today : ranked.slice(0, 3);
  const highCount = ranked.filter((t) => computePriority(t).level === "High").length;
  const upcoming = [...pending]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <Shell>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{greeting()}, Aria</h1>
          <p className="mt-1 text-muted-foreground">
            You have {highCount} high-priority task{highCount === 1 ? "" : "s"} needing attention.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Completion" value={`${completion}%`} />
          <StatCard label="Study hours" value={`${studyHours}h`} />
          <StatCard label="Pending" value={pending.length} />
          <StatCard label="Completed" value={completed.length} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Smart Priority Engine</h2>
              <p className="text-sm text-muted-foreground">
                Ranked by deadline urgency, difficulty &amp; effort
              </p>
            </div>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Auto-ranked
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {ranked.slice(0, 5).map((task) => {
              const p = computePriority(task);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 rounded-2xl border p-4 ${priorityRing(p.level)}`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${priorityBadge(p.level)}`}
                  >
                    {p.level[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">
                        {task.subject} — {task.title}
                      </p>
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        {task.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.reason}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="font-display text-lg font-bold">{p.score}</p>
                  </div>
                </div>
              );
            })}
            {ranked.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Everything is done. Add a task in the Task Manager to see it ranked here.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="gradient-brand grid size-8 place-items-center rounded-lg text-sm">✦</span>
            <h2 className="font-display text-xl font-bold">Today&apos;s Plan</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your next focus blocks, tap to mark them complete.
          </p>
          <div className="mt-4 space-y-2">
            {plan.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="glass-soft flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-secondary"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-md border border-border text-[10px]">
                  ✓
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{task.title}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {task.subject} · {task.hours}h ·{" "}
                    {new Date(task.deadline).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </span>
                <PriorityPill level={computePriority(task).level} />
              </button>
            ))}
            {plan.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending work scheduled.</p>
            )}
          </div>
          <Link
            to="/planner"
            className="gradient-brand mt-5 block w-full rounded-xl py-3 text-center text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110"
          >
            Generate my schedule
          </Link>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="font-display text-lg font-bold">Upcoming Deadlines</h2>
          <div className="mt-4 space-y-3">
            {upcoming.map((task) => {
              const d = Math.ceil(daysUntil(task.deadline));
              return (
                <div key={task.id} className="glass-soft flex items-center justify-between rounded-xl p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(task.deadline).toLocaleString(undefined, {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${priorityBadge(
                      computePriority(task).level,
                    )}`}
                  >
                    {d <= 0 ? "overdue" : `${d} day${d === 1 ? "" : "s"}`}
                  </span>
                </div>
              );
            })}
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No deadlines ahead.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold">Subject Progress</h2>
          <div className="mt-4 space-y-4">
            {subjects.map((s) => (
              <div key={s.subject}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-foreground/80">{s.subject}</span>
                  <span className="text-muted-foreground">{s.percent}%</span>
                </div>
                <ProgressBar percent={s.percent} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="gradient-brand grid size-8 place-items-center rounded-lg text-sm">✦</span>
            <h2 className="font-display text-lg font-bold">AI Quiz Generator</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Turn any topic into MCQ practice with answers, explanations and a score.
          </p>
          <div className="glass-soft mt-4 rounded-2xl p-4">
            <p className="text-sm font-semibold">Suggested topic</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pending[0]?.subject ?? "Thermodynamics"} — build a 10 question set before your next deadline.
            </p>
          </div>
          <Link
            to="/quiz"
            className="glass-soft mt-4 block w-full rounded-xl py-3 text-center text-sm font-semibold transition hover:bg-secondary"
          >
            Generate quiz
          </Link>
        </Card>
      </div>
    </Shell>
  );
}
