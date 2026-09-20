import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/planner", label: "Planner" },
  { to: "/quiz", label: "Quiz" },
  { to: "/progress", label: "Progress" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 size-[520px] rounded-full bg-brand/30 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 size-[560px] rounded-full bg-accent/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 size-[460px] rounded-full bg-brand-glow/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
          <Link to="/" className="flex items-center gap-3">
            <div className="gradient-brand grid size-10 place-items-center rounded-xl font-display text-lg font-bold text-primary-foreground shadow-lg shadow-brand/30">
              S
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-tight">StudyFlow AI</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Your intelligent study companion</p>
            </div>
          </Link>

          <nav className="glass-soft order-3 flex w-full items-center gap-1 overflow-x-auto rounded-xl p-1 md:order-none md:w-auto">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="whitespace-nowrap rounded-lg px-4 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="glass-soft hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="size-2 rounded-full bg-success" />
              AI Online
            </div>
            <div className="gradient-brand grid size-9 place-items-center rounded-full text-sm font-semibold text-primary-foreground">
              AR
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`glass rounded-3xl p-6 shadow-[0_16px_60px_-20px_rgba(0,0,0,0.6)] ${className}`}
    >
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <div
        className="gradient-brand h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
