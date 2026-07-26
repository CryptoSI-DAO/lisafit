import { supabase } from "./supabase-client";
import { generateWorkout, type Exercise, type ExerciseLog } from "./workout-engine";

export type WorkoutWithLogs = {
  id: string;
  workout_date: string;
  day_type: string;
  status: string;
  total_score: number;
  completed_at: string | null;
  exercise_logs: ExerciseLogWithId[];
};

export type ExerciseLogWithId = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  unit: string;
  target: number;
  actual: number;
  score: number;
  completed: boolean;
  position: number;
};

/**
 * Get or create today's workout for the current user
 */
export async function getTodaysWorkout(userId: string): Promise<WorkoutWithLogs | null> {
  const today = new Date().toISOString().split("T")[0];

  // Check if workout already exists for today
  const { data: existing } = await supabase
    .from("daily_workouts")
    .select(
      `
      *,
      exercise_logs (*)
    `
    )
    .eq("user_id", userId)
    .eq("workout_date", today)
    .single();

  if (existing) {
    return {
      ...existing,
      exercise_logs: existing.exercise_logs.sort((a: ExerciseLogWithId, b: ExerciseLogWithId) => a.position - b.position),
    };
  }

  // Need to generate a new workout
  // 1. Fetch all active exercises
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, unit, base_target, difficulty, description")
    .eq("is_active", true);

  if (!exercises || exercises.length === 0) return null;

  // 2. Generate workout
  const { dayType, exercises: generated } = generateWorkout(exercises as Exercise[]);

  // 3. Insert daily_workout
  const { data: workout, error } = await supabase
    .from("daily_workouts")
    .insert({
      user_id: userId,
      workout_date: today,
      day_type: dayType,
      status: dayType === "rest" ? "completed" : "pending",
      total_score: 0,
    })
    .select()
    .single();

  if (error || !workout) return null;

  // 4. Insert exercise logs (skip if rest day)
  if (generated.length > 0) {
    const logsToInsert = generated.map((log) => ({
      workout_id: workout.id,
      ...log,
    }));

    const { data: insertedLogs } = await supabase
      .from("exercise_logs")
      .insert(logsToInsert)
      .select();

    return {
      ...workout,
      exercise_logs: (insertedLogs || []).sort((a, b) => a.position - b.position),
    };
  }

  return { ...workout, exercise_logs: [] };
}

/**
 * Score an exercise: 0-100 based on actual vs target
 *
 * Scoring formula:
 *   actual >= target: 100 (maxed out)
 *   actual < target: proportional, but minimum 0
 *   actual = 0: 0
 */
export function scoreExercise(actual: number, target: number): number {
  if (target <= 0) return 0;
  const raw = (actual / target) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

/**
 * Update an exercise log with the user's result
 */
export async function updateExerciseLog(
  logId: string,
  actual: number
): Promise<{ score: number } | null> {
  // Fetch current log to get target
  const { data: log } = await supabase
    .from("exercise_logs")
    .select("target")
    .eq("id", logId)
    .single();

  if (!log) return null;

  const score = scoreExercise(actual, log.target);

  const { error } = await supabase
    .from("exercise_logs")
    .update({
      actual,
      score,
      completed: true,
    })
    .eq("id", logId);

  if (error) return null;
  return { score };
}

/**
 * Mark a workout as completed and calculate total score
 */
export async function completeWorkout(workoutId: string): Promise<number> {
  // Sum all exercise scores
  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("score")
    .eq("workout_id", workoutId);

  if (!logs || logs.length === 0) {
    // rest day or no exercises
    await supabase
      .from("daily_workouts")
      .update({ status: "completed", completed_at: new Date().toISOString(), total_score: 0 })
      .eq("id", workoutId);
    return 0;
  }

  // Average score * number of exercises = daily score out of (count * 100)
  const totalScore = logs.reduce((sum, l) => sum + l.score, 0);

  await supabase
    .from("daily_workouts")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      total_score: totalScore,
    })
    .eq("id", workoutId);

  return totalScore;
}
