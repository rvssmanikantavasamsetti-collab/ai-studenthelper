import type { PriorityLevel } from "@/lib/studyflow/types";

const styles: Record<PriorityLevel, string> = {
  High: "border-danger/30 bg-danger/10 text-danger",
  Medium: "border-warning/30 bg-warning/10 text-warning",
  Low: "border-success/30 bg-success/10 text-success",
};

export function PriorityPill({ level }: { level: PriorityLevel }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${styles[level]}`}>
      {level}
    </span>
  );
}

export function priorityRing(level: PriorityLevel) {
  return level === "High"
    ? "border-danger/25 bg-danger/[0.06]"
    : level === "Medium"
      ? "border-warning/25 bg-warning/[0.06]"
      : "border-success/25 bg-success/[0.06]";
}

export function priorityBadge(level: PriorityLevel) {
  return level === "High"
    ? "bg-danger/20 text-danger"
    : level === "Medium"
      ? "bg-warning/20 text-warning"
      : "bg-success/20 text-success";
}
