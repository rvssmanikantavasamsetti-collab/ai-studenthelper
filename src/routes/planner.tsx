import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, Shell, StatCard } from "@/components/studyflow/Shell";
import { PriorityPill } from "@/components/studyflow/PriorityPill";
import { buildStudyPlan } from "@/lib/studyflow/planner";
import { computePriority } from "@/lib/studyflow/priority";
import { useStats, useStudyFlow } from "@/lib/studyflow/store";
import type { PlanResult } from "@/lib/studyflow/planner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Study Planner — StudyFlow AI" },
      {
        name: "description",
        content:
          "Enter your available study hours and get a personalised schedule built from your pending tasks and deadlines.",
      },
      { property: "og:title", content: "AI Study Planner — StudyFlow AI" },
      {
        property: "og:description",
        content: "A personalised week of focus blocks generated from your deadlines and effort estimates.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { tasks } = useStudyFlow();
  const { pending, plannedHours } = useStats(tasks);
  const [hours, setHours] = useState("12");
  const [days, setDays] = useState("7");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const grouped = useMemo(() => {
    if (!plan) return [];
    const map = new Map<string, typeof plan.sessions>();
    plan.sessions.forEach((s) => {
      const key = `${s.day} ${new Date(s.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return Array.from(map.entries());
  }, [plan]);

  const generate = () => {
    setLoading(true);
    const h = Math.max(0.5, Number(hours) || 1);
    const d = Math.max(1, Math.min(14, Number(days) || 7));
    window.setTimeout(() => {
      setPlan(buildStudyPlan(tasks, h, d));
      setLoading(false);
    }, 450);
  };

  return (
    <Shell>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI Study Planner</h1>
          <p className="mt-1 text-muted-foreground">
            Tell us your available hours and we build the schedule around your deadlines.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Pending tasks" value={pending.length} />
          <StatCard label="Work remaining" value={`${plannedHours}h`} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="font-display text-xl font-bold">Your availability</h2>
          <label className="mt-4 block">
            <span className="text-xs text-muted-foreground">Available study hours</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              className="field mt-1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs text-muted-foreground">Spread over (days)</span>
            <input
              type="number"
              min="1"
              max="14"
              className="field mt-1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </label>
          <button
            onClick={generate}
            disabled={loading}
            className="gradient-brand mt-5 w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Building your plan…" : "Generate my schedule"}
          </button>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Priority queue
            </p>
            <div className="mt-2 space-y-2">
              {pending.slice(0, 5).map((t) => (
                <div key={t.id} className="glass-soft flex items-center gap-2 rounded-xl p-2.5">
                  <span className="min-w-0 flex-1 truncate text-xs">{t.title}</span>
                  <PriorityPill level={computePriority(t).level} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Your schedule</h2>
          {!plan && (
            <p className="mt-3 text-sm text-muted-foreground">
              Enter the hours you can study and generate a plan — sessions are capped at 2 hours with short
              breaks in between.
            </p>
          )}
          {plan && (
            <>
              <p className="mt-2 text-sm text-accent">{plan.summary}</p>
              <div className="mt-4 space-y-4">
                {grouped.map(([day, sessions]) => (
                  <div key={day}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {day}
                    </p>
                    <div className="mt-2 space-y-2">
                      {sessions.map((s) => (
                        <div key={s.id} className="glass-soft flex items-center gap-3 rounded-xl p-3">
                          <span className="rounded-md bg-brand/20 px-2 py-1 text-[10px] font-semibold text-accent">
                            {s.start}–{s.end}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{s.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {s.subject} · {s.hours}h
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {plan.unscheduled.length > 0 && (
                <div className="mt-5 rounded-2xl border border-warning/25 bg-warning/[0.08] p-4">
                  <p className="text-sm font-semibold text-warning">Not enough hours</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    These still need time: {plan.unscheduled.join(", ")}.
                  </p>
                </div>
              )}
              {plan.sessions.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing pending to schedule — add tasks first.
                </p>
              )}
            </>
          )}
        </Card>
      </div>
    </Shell>
  );
}
