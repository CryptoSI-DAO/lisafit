/**
 * @fileoverview Database operations for workouts and exercise logs.
 *
 * This is the only layer that talks to Supabase for workout data.
 * Pages and components import from here — never query Supabase directly.
 */

import { supabase } from "./supabase-client";
import { generateWorkout } from "./workout-engine";
import { scoreExercise, sumScores } from "./scoring";
import type {
  Exercise,
  ExerciseLog,
  Workout,
  WorkoutWithLogs,
  WorkoutHistoryEntry,
} from "./types";

/**
 * Get today's workout for a user. If it doesn't exist yet,
 * generate and persist it automatically.
 */
export async function getTodaysWorkout(
  userId: string
): Promise<WorkoutWithLogs | null> {
  const today = new Date().toISOString().split("T")[0];

  // 1. Check if workout already exists for today
  const { data: existing } = await supabase
    .from("daily_workouts")
    .select("*, exercise_logs (*)")
    .eq("user_id", userId)
    .eq("workout_date", today)
    .single();

  if (existing) {
    const sorted = (existing.exercise_logs as ExerciseLog[]).sort(
      (a, b) => a.position - b.position
    );
    return { ...(existing as Workout), exercise_logs: sorted };
  }

  // 2. Fetch active exercises
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, unit, base_target, difficulty, description, is_active")
    .eq("is_active", true);

  if (!exercises || exercises.length === 0) return null;

  // 3. Generate workout plan
  const { dayType, exercises: generated } = generateWorkout(
    exercises as Exercise[]
  );

  // 4. Insert daily_workout record
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

  // 5. Insert exercise logs (skip if rest day)
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
      ...(workout as Workout),
      exercise_logs: (insertedLogs as ExerciseLog[]) || [],
    };
  }

  return { ...(workout as Workout), exercise_logs: [] };
}

/**
 * Get recent workout history for the dashboard.
 */
export async function getWorkoutHistory(
  userId: string,
  limit = 28
): Promise<WorkoutHistoryEntry[]> {
  const { data } = await supabase
    .from("daily_workouts")
    .select("id, workout_date, day_type, status, total_score")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false })
    .limit(limit);

  return (data as WorkoutHistoryEntry[]) || [];
}

/**
 * Save a user's result for a single exercise.
 * Returns the computed score or null on failure.
 */
export async function updateExerciseLog(
  logId: string,
  actual: number
): Promise<{ score: number } | null> {
  const { data: log } = await supabase
    .from("exercise_logs")
    .select("target")
    .eq("id", logId)
    .single();

  if (!log) return null;

  const score = scoreExercise(actual, log.target);

  const { error } = await supabase
    .from("exercise_logs")
    .update({ actual, score, completed: true })
    .eq("id", logId);

  if (error) return null;
  return { score };
}

/**
 * Mark a workout as completed and compute the total score.
 */
export async function completeWorkout(workoutId: string): Promise<number> {
  const { data: logs } = await supabase
    .from("exercise_logs")
    .select("score")
    .eq("workout_id", workoutId);

  if (!logs || logs.length === 0) {
    await supabase
      .from("daily_workouts")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_score: 0,
      })
      .eq("id", workoutId);
    return 0;
  }

  const totalScore = sumScores(logs.map((l) => l.score));

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
