"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { BottomNav } from "@/components/bottom-nav";

type WorkoutHistory = {
  id: string;
  workout_date: string;
  day_type: string;
  status: string;
  total_score: number;
};

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutHistory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function fetchHistory() {
      const { data } = await supabase
        .from("daily_workouts")
        .select("id, workout_date, day_type, status, total_score")
        .eq("user_id", userId)
        .order("workout_date", { ascending: false })
        .limit(28);

      setWorkouts(data || []);
      setDataLoading(false);
    }
    fetchHistory();
  }, [user]);

  if (loading || dataLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e7f900] border-t-transparent" />
      </main>
    );
  }

  if (!user) return null;

  // Calculate stats
  const completed = workouts.filter((w) => w.status === "completed");
  const totalScore = completed.reduce((s, w) => s + w.total_score, 0);
  const totalExercises = completed.length;

  // Current streak (consecutive completed days)
  let streak = 0;
  const sortedByDate = [...workouts].sort(
    (a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
  );
  for (const w of sortedByDate) {
    if (w.status === "completed") streak++;
    else if (w.status === "skipped") break;
    // pending days don't break the streak (not yet attempted)
  }

  // This week's score (Mon-Fri)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const mondayStr = monday.toISOString().split("T")[0];

  const thisWeek = workouts.filter((w) => w.workout_date >= mondayStr);
  const weekScore = thisWeek
    .filter((w) => w.status === "completed")
    .reduce((s, w) => s + w.total_score, 0);
  const weekDays = thisWeek.filter((w) => w.status === "completed").length;

  // Best single exercise scores
  const avgScore = totalExercises > 0 ? Math.round(totalScore / totalExercises) : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">Your Progress</h1>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard
            label="Current Streak"
            value={String(streak)}
            suffix={streak === 1 ? "day" : "days"}
            color="#e7f900"
          />
          <StatCard
            label="This Week"
            value={String(weekScore)}
            suffix={`${weekDays}/5 active`}
            color="#22c55e"
          />
          <StatCard
            label="Total Score"
            value={totalScore.toLocaleString()}
            suffix={`${totalExercises} workouts`}
            color="#6366f1"
          />
          <StatCard
            label="Avg / Day"
            value={String(avgScore)}
            suffix="points"
            color="#f85149"
          />
        </div>

        {/* Weekly bar chart */}
        <div className="mt-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888]">
            This Week
          </h2>
          <WeeklyChart workouts={thisWeek} />
        </div>

        {/* History list */}
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[#888]">
            Recent Workouts
          </h2>
          {workouts.length === 0 ? (
            <p className="rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-6 text-center text-sm text-[#555]">
              No workouts yet. Start your first one today!
            </p>
          ) : (
            <div className="space-y-2">
              {workouts.slice(0, 14).map((w) => (
                <HistoryRow key={w.id} workout={w} />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

function StatCard({
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

function WeeklyChart({ workouts }: { workouts: WorkoutHistory[] }) {
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

  const dayColors: Record<string, string> = {
    easy: "#22c55e",
    normal: "#e7f900",
    tough: "#f85149",
    rest: "#6366f1",
  };

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
          <span className={`text-[0.55rem] ${d.isToday ? "font-bold text-[#e7f900]" : "text-[#555]"}`}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}

function HistoryRow({ workout }: { workout: WorkoutHistory }) {
  const date = new Date(workout.workout_date);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const dayColors: Record<string, string> = {
    easy: "#22c55e",
    normal: "#e7f900",
    tough: "#f85149",
    rest: "#6366f1",
  };

  const color = dayColors[workout.day_type] || "#888";

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
