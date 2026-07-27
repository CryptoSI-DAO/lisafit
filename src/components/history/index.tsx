import type { WorkoutHistoryEntry } from "@/lib/types";
import { DAY_TYPE_CONFIG } from "@/lib/constants";

/**
 * Stat card for the history dashboard grid.
 */
export function StatCard({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: string;
  suffix: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#161616] p-4">
      <p className="text-[0.6rem] uppercase tracking-wider text-[#888]">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[0.6rem] text-[#555]">{suffix}</p>
    </div>
  );
}

/**
 * Weekly bar chart showing Mon-Sun workout scores.
 */
export function WeeklyChart({ workouts }: { workouts: WorkoutHistoryEntry[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const dayData = days.map((day, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + mondayOffset + i);
    const dateStr = date.toISOString().split("T")[0];
    const workout = workouts.find((w) => w.workout_date === dateStr);

    return {
      day,
      score: workout?.status === "completed" ? workout.total_score : 0,
      completed: workout?.status === "completed",
      isToday: dateStr === now.toISOString().split("T")[0],
    };
  });

  const maxScore = Math.max(...dayData.map((d) => d.score), 700);

  return (
    <div className="flex h-32 items-end justify-between gap-1.5 rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3">
      {dayData.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-md transition-all ${
                d.completed ? "opacity-100" : "opacity-20"
              } ${d.isToday ? "ring-1 ring-[#e7f900]" : ""}`}
              style={{
                height: d.score > 0 ? `${Math.max((d.score / maxScore) * 100, 8)}%` : "4px",
                backgroundColor: d.score > 0 ? "#e7f900" : "#2a2a2a",
              }}
            />
          </div>
          <span
            className={`text-[0.55rem] ${
              d.isToday ? "font-bold text-[#e7f900]" : "text-[#555]"
            }`}
          >
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Single row in the workout history list.
 */
export function HistoryRow({ workout }: { workout: WorkoutHistoryEntry }) {
  const date = new Date(workout.workout_date);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const color = DAY_TYPE_CONFIG[workout.day_type as keyof typeof DAY_TYPE_CONFIG]?.color || "#888";

  const statusLabel =
    workout.status === "completed"
      ? `${workout.total_score} pts`
      : workout.status === "skipped"
      ? "Skipped"
      : "Pending";

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <div>
          <p className="text-sm font-medium">{dateStr}</p>
          <p className="text-[0.6rem] uppercase tracking-wider text-[#555]">
            {workout.day_type}
          </p>
        </div>
      </div>
      <span
        className={`font-mono text-sm font-bold ${
          workout.status === "completed" ? "text-[#e7f900]" : "text-[#555]"
        }`}
      >
        {statusLabel}
      </span>
    </div>
  );
}
