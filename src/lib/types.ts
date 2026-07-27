/**
 * @fileoverview Shared type definitions for LisaFit.
 *
 * These types mirror the Supabase database schema.
 * Import from here everywhere — never re-define types inline.
 */

// ─── Enums ────────────────────────────────────────────────

export type DayType = "easy" | "normal" | "tough" | "rest";

export type ExerciseDifficulty = "easy" | "normal" | "hard";

export type WorkoutStatus = "pending" | "in_progress" | "completed" | "skipped";

export type MuscleGroup =
  | "push"
  | "pull"
  | "legs"
  | "core"
  | "cardio"
  | "fullbody"
  | "mobility";

export type ExerciseUnit = "reps" | "seconds";

// ─── Database Row Types ──────────────────────────────────

/** Row from the `exercises` table */
export type Exercise = {
  id: string;
  name: string;
  category: string;
  muscle_group: MuscleGroup;
  unit: ExerciseUnit;
  base_target: number;
  difficulty: ExerciseDifficulty;
  description: string | null;
  is_active: boolean;
};

/** Row from the `daily_workouts` table */
export type Workout = {
  id: string;
  user_id: string;
  workout_date: string;
  day_type: DayType;
  status: WorkoutStatus;
  total_score: number;
  completed_at: string | null;
};

/** Row from the `exercise_logs` table */
export type ExerciseLog = {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_name: string;
  unit: ExerciseUnit;
  target: number;
  actual: number;
  score: number;
  completed: boolean;
  position: number;
};

// ─── Composite Types ─────────────────────────────────────

/** Workout with its nested exercise logs, as returned by Supabase joins */
export type WorkoutWithLogs = Workout & {
  exercise_logs: ExerciseLog[];
};

/** Lightweight workout record for history lists */
export type WorkoutHistoryEntry = Pick<
  Workout,
  "id" | "workout_date" | "day_type" | "status" | "total_score"
>;

// ─── Engine Types ────────────────────────────────────────

/** Generated exercise data before it's persisted to the database */
export type GeneratedExercise = {
  exercise_id: string;
  exercise_name: string;
  unit: ExerciseUnit;
  target: number;
  position: number;
};

/** Return type of the workout generator */
export type GeneratedWorkout = {
  dayType: DayType;
  exercises: GeneratedExercise[];
};
