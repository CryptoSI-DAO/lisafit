import type { ExerciseLog } from "@/lib/types";

/**
 * Circular score indicator shown after each exercise.
 * Color-coded: green ≥80, yellow ≥50, red <50.
 */
export function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#e7f900" : "#f85149";
  const label =
    score >= 80 ? "BEAST" : score >= 50 ? "SOLID" : score >= 25 ? "TRY AGAIN" : "WEAK";

  return (
    <div
      className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4"
      style={{ borderColor: color }}
    >
      <div>
        <p className="text-3xl font-bold" style={{ color }}>
          {score}
        </p>
        <p className="text-[0.6rem] font-bold tracking-wider" style={{ color }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * Card showing the current exercise with target and input.
 */
export function ExerciseInput({
  log,
  actualValue,
  onChange,
  onSubmit,
}: {
  log: ExerciseLog;
  actualValue: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-8">
      <h1 className="text-4xl font-bold">{log.exercise_name}</h1>
      <p className="mt-2 text-sm text-[#888]">
        Target:{" "}
        <span className="font-mono text-[#e7f900]">
          {log.target} {log.unit}
        </span>
      </p>

      <div className="mt-10">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#888]">
          How many did you do?
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={actualValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && actualValue && onSubmit()}
          autoFocus
          className="w-full rounded-2xl border border-[#2a2a2a] bg-[#161616] px-5 py-4 text-center text-3xl font-bold text-white outline-none transition focus:border-[#e7f900]/50"
          placeholder="0"
        />
        <p className="mt-2 text-center text-xs text-[#555]">
          Enter your {log.unit} count
        </p>
      </div>

      <div className="mt-6 flex gap-2">
        <QuickButton label="Hit target" onClick={() => onChange(String(log.target))} />
        <QuickButton
          label="Half"
          onClick={() => onChange(String(Math.round(log.target / 2)))}
        />
        <QuickButton label="Skip" onClick={() => onChange("0")} />
      </div>

      <button
        onClick={onSubmit}
        disabled={!actualValue}
        className="mt-8 w-full rounded-xl bg-[#e7f900] py-4 font-bold text-black transition active:scale-[0.98] disabled:opacity-30"
      >
        LOG RESULT
      </button>
    </div>
  );
}

/**
 * Result view shown after logging an exercise score.
 */
export function ExerciseResult({
  score,
  log,
  actualValue,
  isLast,
  onNext,
}: {
  score: number;
  log: ExerciseLog;
  actualValue: string;
  isLast: boolean;
  onNext: () => void;
}) {
  return (
    <div className="mt-8 text-center">
      <ScoreCircle score={score} />
      <h2 className="mt-6 text-2xl font-bold">{log.exercise_name}</h2>
      <p className="mt-1 font-mono text-sm text-[#888]">
        {actualValue} / {log.target} {log.unit}
      </p>
      <button
        onClick={onNext}
        className="mt-8 w-full rounded-xl bg-[#e7f900] py-4 font-bold text-black transition active:scale-[0.98]"
      >
        {isLast ? "FINISH WORKOUT 🎉" : "NEXT EXERCISE →"}
      </button>
    </div>
  );
}

/**
 * Rest day screen shown on Sundays.
 */
export function RestDayView({
  userName,
  onSignOut,
}: {
  userName: string;
  onSignOut: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <div className="text-6xl">😴</div>
      <h1 className="mt-6 text-3xl font-bold text-[#6366f1]">REST DAY</h1>
      <p className="mt-2 text-sm text-[#888]">
        Recovery is part of growth, {userName}. Stretch, hydrate, sleep.
      </p>
      <p className="mt-1 text-xs text-[#555]">
        See you tomorrow for a fresh workout.
      </p>
      <button
        onClick={onSignOut}
        className="mt-10 rounded-lg border border-[#2a2a2a] px-4 py-2 text-xs text-[#888] transition hover:border-[#f85149]/50"
      >
        Sign out
      </button>
    </main>
  );
}

/**
 * Workout completion summary with per-exercise breakdown.
 */
export function WorkoutComplete({
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
  logs: ExerciseLog[];
  onFinish: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 pt-12 pb-24">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-4 text-3xl font-bold text-[#e7f900]">
            WORKOUT COMPLETE
          </h1>
          <p className="mt-1 text-sm text-[#888]">
            {dayLabel} day done. Lisa is proud.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-[#888]">
            Today&apos;s Score
          </p>
          <p className="mt-2 text-5xl font-bold text-[#e7f900]">{totalScore}</p>
          <p className="mt-1 text-sm text-[#555]">
            out of {maxScore} ({pct}%)
          </p>
        </div>

        <div className="mt-6 space-y-2">
          {logs.map((log) => (
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
                  color:
                    log.score >= 80
                      ? "#22c55e"
                      : log.score >= 50
                      ? "#e7f900"
                      : "#f85149",
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

// ─── Internal ────────────────────────────────────────────

function QuickButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-lg border border-[#2a2a2a] py-2.5 text-xs font-medium text-[#888] transition active:scale-95 hover:border-[#e7f900]/30 hover:text-white"
    >
      {label}
    </button>
  );
}
