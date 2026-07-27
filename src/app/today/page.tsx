"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useRouter } from "next/navigation";
import {
  getTodaysWorkout,
  updateExerciseLog,
  completeWorkout,
} from "@/lib/workout-api";
import { DAY_TYPE_CONFIG } from "@/lib/constants";
import type { WorkoutWithLogs } from "@/lib/types";
import { BottomNav } from "@/components/bottom-nav";
import { LoadingScreen } from "@/components/loading-screen";
import {
  ExerciseInput,
  ExerciseResult,
  RestDayView,
  WorkoutComplete,
} from "@/components/workout";

export default function TodayPage() {
  const { user, signOut } = useAuth();
  const authLoading = useRequireAuth();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithLogs | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [actualValue, setActualValue] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [allDone, setAllDone] = useState(false);

  // ─── Auth guard ──────────────────────────────────────
  // (handled by useRequireAuth above)

  // ─── Load workout ────────────────────────────────────
  const loadWorkout = useCallback(async () => {
    if (!user) return;
    setLoadingWorkout(true);
    const w = await getTodaysWorkout(user.id);
    setWorkout(w);
    if (w && w.exercise_logs.length > 0) {
      const firstIncomplete = w.exercise_logs.findIndex((l) => !l.completed);
      if (firstIncomplete === -1) setAllDone(true);
      else setCurrentIdx(firstIncomplete);
    }
    setLoadingWorkout(false);
  }, [user]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  // ─── Handlers ────────────────────────────────────────
  const handleLogResult = async () => {
    if (!workout || !actualValue) return;
    const log = workout.exercise_logs[currentIdx];
    const result = await updateExerciseLog(log.id, parseInt(actualValue, 10) || 0);
    if (result) {
      setLastScore(result.score);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    setActualValue("");

    if (workout) {
      const updated = { ...workout };
      updated.exercise_logs[currentIdx].completed = true;
      updated.exercise_logs[currentIdx].actual = parseInt(actualValue, 10) || 0;
      setWorkout(updated);
    }

    const nextIdx = currentIdx + 1;
    if (workout && nextIdx >= workout.exercise_logs.length) {
      setAllDone(true);
    } else {
      setCurrentIdx(nextIdx);
    }
  };

  const handleFinish = async () => {
    if (!workout) return;
    await completeWorkout(workout.id);
    router.push("/history");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // ─── Render gates ────────────────────────────────────
  if (authLoading || loadingWorkout) return <LoadingScreen />;
  if (!user || !workout) return <LoadingScreen />;

  const dayConfig = DAY_TYPE_CONFIG[workout.day_type];

  // Rest day
  if (workout.day_type === "rest") {
    return (
      <RestDayView
        userName={user.user_metadata?.display_name || user.email?.split("@")[0] || "Athlete"}
        onSignOut={handleSignOut}
      />
    );
  }

  // Completed
  if (allDone || workout.status === "completed") {
    const completedLogs = workout.exercise_logs.filter((l) => l.completed);
    const totalScore = completedLogs.reduce((s, l) => s + l.score, 0);
    const maxScore = workout.exercise_logs.length * 100;
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return (
      <WorkoutComplete
        totalScore={totalScore}
        maxScore={maxScore}
        pct={pct}
        dayLabel={dayConfig.label}
        logs={workout.exercise_logs}
        onFinish={handleFinish}
      />
    );
  }

  // Active exercise
  const currentLog = workout.exercise_logs[currentIdx];
  if (!currentLog) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        {/* Day type badge + progress */}
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider"
            style={{
              color: dayConfig.color,
              backgroundColor: `${dayConfig.color}1a`,
              border: `1px solid ${dayConfig.color}33`,
            }}
          >
            {dayConfig.emoji} {dayConfig.label}
          </span>
          <p className="font-mono text-xs text-[#888]">
            {currentIdx + 1} / {workout.exercise_logs.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full rounded-full bg-[#2a2a2a]">
          <div
            className="h-full rounded-full bg-[#e7f900] transition-all duration-300"
            style={{
              width: `${((currentIdx + (showResult ? 1 : 0)) / workout.exercise_logs.length) * 100}%`,
            }}
          />
        </div>

        {/* Exercise card or result */}
        {showResult ? (
          <ExerciseResult
            score={lastScore}
            log={currentLog}
            actualValue={actualValue}
            isLast={currentIdx + 1 >= workout.exercise_logs.length}
            onNext={handleNext}
          />
        ) : (
          <ExerciseInput
            log={currentLog}
            actualValue={actualValue}
            onChange={setActualValue}
            onSubmit={handleLogResult}
          />
        )}
      </div>
      {!showResult && <BottomNav />}
    </main>
  );
}
