"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  getTodaysWorkout,
  updateExerciseLog,
  completeWorkout,
  type WorkoutWithLogs,
} from "@/lib/workout-api";
import { BottomNav } from "@/components/bottom-nav";

const DAY_TYPE_CONFIG = {
  easy: { color: "#22c55e", label: "EASY", emoji: "🌿" },
  normal: { color: "#e7f900", label: "NORMAL", emoji: "🔥" },
  tough: { color: "#f85149", label: "TOUGH", emoji: "💀" },
  rest: { color: "#6366f1", label: "REST", emoji: "😴" },
};

export default function TodayPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithLogs | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [actualValue, setActualValue] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const loadWorkout = useCallback(async () => {
    if (!user) return;
    setLoadingWorkout(true);
    const w = await getTodaysWorkout(user.id);
    setWorkout(w);

    // Find first incomplete exercise
    if (w && w.exercise_logs.length > 0) {
      const firstIncomplete = w.exercise_logs.findIndex((l) => !l.completed);
      if (firstIncomplete === -1) {
        setAllDone(true);
      } else {
        setCurrentExerciseIdx(firstIncomplete);
      }
    }
    setLoadingWorkout(false);
  }, [user]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const handleLogResult = async () => {
    if (!workout || !actualValue) return;
    const log = workout.exercise_logs[currentExerciseIdx];
    const actual = parseInt(actualValue, 10) || 0;

    const result = await updateExerciseLog(log.id, actual);
    if (result) {
      setLastScore(result.score);
      setShowResult(true);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    setActualValue("");
    setLastScore(null);

    // Update workout state
    if (workout) {
      const updated = { ...workout };
      updated.exercise_logs[currentExerciseIdx].completed = true;
      updated.exercise_logs[currentExerciseIdx].actual = parseInt(actualValue, 10) || 0;
      setWorkout(updated);
    }

    const nextIdx = currentExerciseIdx + 1;
    if (workout && nextIdx >= workout.exercise_logs.length) {
      setAllDone(true);
    } else {
      setCurrentExerciseIdx(nextIdx);
    }
  };

  const handleFinish = async () => {
    if (!workout) return;
    await completeWorkout(workout.id);
    router.push("/history");
  };

  if (loading || loadingWorkout) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#e7f900] border-t-transparent" />
          <p className="text-sm text-[#888]">Loading your workout...</p>
        </div>
      </main>
    );
  }

  if (!user || !workout) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <p className="text-sm text-[#888]">Something went wrong. Try refreshing.</p>
      </main>
    );
  }

  const dayConfig = DAY_TYPE_CONFIG[workout.day_type as keyof typeof DAY_TYPE_CONFIG];

  // REST DAY
  if (workout.day_type === "rest") {
    return (
      <RestDayView
        userName={user.user_metadata?.display_name || user.email?.split("@")[0]}
        onSignOut={async () => {
          await signOut();
          router.push("/");
        }}
      />
    );
  }

  // COMPLETED
  if (allDone || workout.status === "completed") {
    const completedLogs = workout.exercise_logs.filter((l) => l.completed);
    const totalScore = completedLogs.reduce((sum, l) => sum + l.score, 0);
    const maxScore = workout.exercise_logs.length * 100;
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return (
      <CompletedView
        totalScore={totalScore}
        maxScore={maxScore}
        pct={pct}
        dayLabel={dayConfig.label}
        logs={workout.exercise_logs}
        onFinish={handleFinish}
      />
    );
  }

  // ACTIVE EXERCISE
  const currentLog = workout.exercise_logs[currentExerciseIdx];
  if (!currentLog) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
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
          </div>
          <p className="font-mono text-xs text-[#888]">
            {currentExerciseIdx + 1} / {workout.exercise_logs.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full rounded-full bg-[#2a2a2a]">
          <div
            className="h-full rounded-full bg-[#e7f900] transition-all duration-300"
            style={{
              width: `${((currentExerciseIdx + (showResult ? 1 : 0)) / workout.exercise_logs.length) * 100}%`,
            }}
          />
        </div>

        {/* Exercise card */}
        {!showResult ? (
          <div className="mt-8">
            <h1 className="text-4xl font-bold">{currentLog.exercise_name}</h1>
            <p className="mt-2 text-sm text-[#888]">
              Target:{" "}
              <span className="font-mono text-[#e7f900]">
                {currentLog.target} {currentLog.unit}
              </span>
            </p>

            {/* Input */}
            <div className="mt-10">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#888]">
                How many did you do?
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={actualValue}
                onChange={(e) => setActualValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && actualValue && handleLogResult()}
                autoFocus
                className="w-full rounded-2xl border border-[#2a2a2a] bg-[#161616] px-5 py-4 text-center text-3xl font-bold text-white outline-none transition focus:border-[#e7f900]/50"
                placeholder="0"
              />
              <p className="mt-2 text-center text-xs text-[#555]">
                Enter your {currentLog.unit} count
              </p>
            </div>

            {/* Quick buttons */}
            <div className="mt-6 flex gap-2">
              <QuickButton
                label="Hit target"
                onClick={() => setActualValue(String(currentLog.target))}
              />
              <QuickButton
                label="Half"
                onClick={() => setActualValue(String(Math.round(currentLog.target / 2)))}
              />
              <QuickButton label="Skip" onClick={() => { setActualValue("0"); }} />
            </div>

            <button
              onClick={handleLogResult}
              disabled={!actualValue}
              className="mt-8 w-full rounded-xl bg-[#e7f900] py-4 font-bold text-black transition active:scale-[0.98] disabled:opacity-30"
            >
              LOG RESULT
            </button>
          </div>
        ) : (
          /* Result screen */
          <div className="mt-8 text-center">
            <ScoreCircle score={lastScore || 0} />

            <h2 className="mt-6 text-2xl font-bold">{currentLog.exercise_name}</h2>
            <p className="mt-1 font-mono text-sm text-[#888]">
              {actualValue} / {currentLog.target} {currentLog.unit}
            </p>

            <button
              onClick={handleNext}
              className="mt-8 w-full rounded-xl bg-[#e7f900] py-4 font-bold text-black transition active:scale-[0.98]"
            >
              {currentExerciseIdx + 1 >= workout.exercise_logs.length
                ? "FINISH WORKOUT 🎉"
                : "NEXT EXERCISE →"}
            </button>
          </div>
        )}
      </div>
      {!showResult && <BottomNav />}
    </main>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-lg border border-[#2a2a2a] py-2.5 text-xs font-medium text-[#888] transition active:scale-95 hover:border-[#e7f900]/30 hover:text-white"
    >
      {label}
    </button>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#e7f900" : "#f85149";
  const label = score >= 80 ? "BEAST" : score >= 50 ? "SOLID" : score >= 25 ? "TRY AGAIN" : "WEAK";

  return (
    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4" style={{ borderColor: color }}>
      <div>
        <p className="text-3xl font-bold" style={{ color }}>{score}</p>
        <p className="text-[0.6rem] font-bold tracking-wider" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

function RestDayView({ userName, onSignOut }: { userName: string; onSignOut: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <div className="text-6xl">😴</div>
      <h1 className="mt-6 text-3xl font-bold text-[#6366f1]">REST DAY</h1>
      <p className="mt-2 text-sm text-[#888]">
        Recovery is part of growth, {userName}. Stretch, hydrate, sleep.
      </p>
      <p className="mt-1 text-xs text-[#555]">See you tomorrow for a fresh workout.</p>

      <button
        onClick={onSignOut}
        className="mt-10 rounded-lg border border-[#2a2a2a] px-4 py-2 text-xs text-[#888] transition hover:border-[#f85149]/50"
      >
        Sign out
      </button>
      <BottomNav />
    </main>
  );
}

function CompletedView({
  totalScore,
  maxScore,
  pct,
  dayLabel,
  logs,
  onFinish,
}: {
  totalScore: number;
  maxScore: number;
  pct: number;
  dayLabel: string;
  logs: WorkoutWithLogs["exercise_logs"];
  onFinish: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-4 text-3xl font-bold text-[#e7f900]">WORKOUT COMPLETE</h1>
          <p className="mt-1 text-sm text-[#888]">{dayLabel} day done. Lisa is proud.</p>
        </div>

        {/* Score */}
        <div className="mt-8 rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-[#888]">Today&apos;s Score</p>
          <p className="mt-2 text-5xl font-bold text-[#e7f900]">{totalScore}</p>
          <p className="mt-1 text-sm text-[#555]">out of {maxScore} ({pct}%)</p>
        </div>

        {/* Breakdown */}
        <div className="mt-6 space-y-2">
          {logs.map((log, i) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{log.exercise_name}</p>
                <p className="font-mono text-xs text-[#555]">
                  {log.actual} / {log.target} {log.unit}
                </p>
              </div>
              <span
                className="font-mono text-lg font-bold"
                style={{
                  color: log.score >= 80 ? "#22c55e" : log.score >= 50 ? "#e7f900" : "#f85149",
                }}
              >
                {log.score}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onFinish}
          className="mt-8 w-full rounded-xl bg-[#e7f900] py-4 font-bold text-black transition active:scale-[0.98]"
        >
          VIEW PROGRESS →
        </button>
      </div>
    </main>
  );
}
