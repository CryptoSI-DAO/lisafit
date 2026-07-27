"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { BottomNav } from "@/components/bottom-nav";
import { LoadingScreen } from "@/components/loading-screen";
import { StatCard, WeeklyChart, HistoryRow } from "@/components/history";
import type { WorkoutHistoryEntry } from "@/lib/types";

export default function HistoryPage() {
  const { user } = useAuth();
  const authLoading = useRequireAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutHistoryEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    supabase
      .from("daily_workouts")
      .select("id, workout_date, day_type, status, total_score")
      .eq("user_id", userId)
      .order("workout_date", { ascending: false })
      .limit(28)
      .then(({ data }) => {
        setWorkouts((data as WorkoutHistoryEntry[]) || []);
        setDataLoading(false);
      });
  }, [user]);

  if (authLoading || dataLoading) return <LoadingScreen />;
  if (!user) return <LoadingScreen />;

  // ─── Calculate stats ─────────────────────────────────
  const completed = workouts.filter((w) => w.status === "completed");
  const totalScore = completed.reduce((s, w) => s + w.total_score, 0);

  // Streak: consecutive completed days (most recent first)
  let streak = 0;
  for (const w of workouts) {
    if (w.status === "completed") streak++;
    else if (w.status === "skipped") break;
  }

  // This week (Mon-Fri)
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

  const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;

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
            suffix={`${completed.length} workouts`}
            color="#6366f1"
          />
          <StatCard
            label="Avg / Day"
            value={String(avgScore)}
            suffix="points"
            color="#f85149"
          />
        </div>

        {/* Weekly chart */}
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
