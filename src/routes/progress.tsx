import { createFileRoute } from "@tanstack/react-router";
import { Card, ProgressBar, Shell, StatCard } from "@/components/studyflow/Shell";
import { useStats, useStudyFlow } from "@/lib/studyflow/store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — StudyFlow AI" },
      {
        name: "description",
        content:
          "Track completed and pending tasks, completion percentage, study hours and subject-wise progress.",
      },
      { property: "og:title", content: "Progress — StudyFlow AI" },
      {
        property: "og:description",
        content: "Subject-wise progress, study hours logged and your completion rate at a glance.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { tasks, attempts } = useStudyFlow();
  const { completed, pending, completion, studyHours, plannedHours, subjects } = useStats(tasks);
  const avgQuiz = attempts.length
    ? Math.round(
        (attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100,
      )
    : null;

  return (
    <Shell>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Progress</h1>
          <p className="mt-1 text-muted-foreground">How your term is tracking, subject by subject.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Completed" value={completed.length} />
          <StatCard label="Pending" value={pending.length} />
          <StatCard label="Completion" value={`${completion}%`} />
          <StatCard label="Study hours" value={`${studyHours}h`} hint={`${plannedHours}h remaining`} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Subject-wise progress</h2>
          <div className="mt-5 space-y-5">
            {subjects.map((s) => (
              <div key={s.subject}>
                <div className="mb-1.5 flex flex-wrap justify-between gap-2 text-xs">
                  <span className="font-medium">{s.subject}</span>
                  <span className="text-muted-foreground">
                    {s.done}/{s.total} tasks · {s.hours}h logged · {s.percent}%
                  </span>
                </div>
                <ProgressBar percent={s.percent} />
              </div>
            ))}
            {subjects.length === 0 && (
              <p className="text-sm text-muted-foreground">Add tasks to start tracking progress.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold">Overall completion</h2>
          <div className="mt-6 flex flex-col items-center">
            <div
              className="grid size-40 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--brand) ${completion * 3.6}deg, color-mix(in oklab, white 8%, transparent) 0deg)`,
              }}
            >
              <div className="grid size-32 place-items-center rounded-full bg-background">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold">{completion}%</p>
                  <p className="text-[11px] text-muted-foreground">complete</p>
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              {completed.length} of {tasks.length} tasks done
            </p>
            {avgQuiz !== null && (
              <p className="mt-1 text-sm text-accent">Average quiz score {avgQuiz}%</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-bold">Recently completed</h2>
          <div className="mt-4 space-y-2">
            {completed.slice(0, 6).map((t) => (
              <div key={t.id} className="glass-soft flex items-center justify-between rounded-xl p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.subject} · {t.hours}h · {t.type}
                  </p>
                </div>
                <span className="rounded-full bg-success/15 px-2 py-1 text-[10px] font-semibold text-success">
                  Done
                </span>
              </div>
            ))}
            {completed.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing completed yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-bold">Still pending</h2>
          <div className="mt-4 space-y-2">
            {pending.slice(0, 6).map((t) => (
              <div key={t.id} className="glass-soft flex items-center justify-between rounded-xl p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.subject} · {t.hours}h · due{" "}
                    {new Date(t.deadline).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-warning/15 px-2 py-1 text-[10px] font-semibold text-warning">
                  {t.difficulty}
                </span>
              </div>
            ))}
            {pending.length === 0 && <p className="text-sm text-muted-foreground">All caught up.</p>}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
