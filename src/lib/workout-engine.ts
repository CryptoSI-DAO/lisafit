/**
 * @fileoverview Daily Workout Generation Engine
 *
 * Pure functions that determine day type and select exercises.
 * No database access — takes exercise list in, returns generated workout out.
 *
 * Seeded by date so the same date always produces the same workout
 * for all users. This ensures fairness in future leaderboard features.
 */

import type {
  DayType,
  Exercise,
  GeneratedExercise,
  GeneratedWorkout,
} from "./types";
import {
  DAY_SCHEDULE,
  DAY_TYPE_CONFIG,
  DIFFICULTY_DISTRIBUTION,
  TARGET_MULTIPLIERS,
} from "./constants";

/**
 * Get the workout day type for a given date.
 * @param date - Defaults to today
 */
export function getDayType(date: Date = new Date()): DayType {
  return DAY_SCHEDULE[date.getDay()] ?? "normal";
}

/**
 * Convert a date to a deterministic numeric seed.
 * Same date → same seed → same workout everywhere.
 */
function dateToSeed(date: Date): number {
  return (
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate()
  );
}

/**
 * Seeded Fisher-Yates shuffle (deterministic per seed).
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let m = result.length;
  let t: T;
  let i: number;

  // Linear Congruential Generator
  let rng = seed;
  const random = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };

  while (m) {
    i = Math.floor(random() * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }

  return result;
}

/**
 * Pick exercises from a pool, prioritizing muscle group diversity.
 * Falls back to allowing repeat muscle groups if not enough unique ones.
 */
function pickExercises(
  pool: Exercise[],
  count: number,
  usedMuscleGroups: Set<string>
): Exercise[] {
  const picked: Exercise[] = [];

  // First pass: prefer unused muscle groups
  for (const ex of pool) {
    if (picked.length >= count) break;
    if (!usedMuscleGroups.has(ex.muscle_group)) {
      picked.push(ex);
      usedMuscleGroups.add(ex.muscle_group);
    }
  }

  // Second pass: fill remaining slots (allow repeats)
  if (picked.length < count) {
    for (const ex of pool) {
      if (picked.length >= count) break;
      if (!picked.includes(ex)) picked.push(ex);
    }
  }

  return picked;
}

/**
 * Generate a workout for a specific date.
 *
 * @param allExercises - Active exercises from the database
 * @param date - Which day to generate for (defaults to today)
 * @returns Day type + generated exercise list with adjusted targets
 */
export function generateWorkout(
  allExercises: Exercise[],
  date: Date = new Date()
): GeneratedWorkout {
  const dayType = getDayType(date);
  const targetCount = DAY_TYPE_CONFIG[dayType].exerciseCount;

  if (dayType === "rest" || targetCount === 0) {
    return { dayType: "rest", exercises: [] };
  }

  const dist = DIFFICULTY_DISTRIBUTION[dayType];
  const seed = dateToSeed(date);
  const multiplier = TARGET_MULTIPLIERS[dayType];

  // Group and shuffle exercises by difficulty
  const byDifficulty = {
    easy: seededShuffle(
      allExercises.filter((e) => e.difficulty === "easy"),
      seed + 1
    ),
    normal: seededShuffle(
      allExercises.filter((e) => e.difficulty === "normal"),
      seed + 2
    ),
    hard: seededShuffle(
      allExercises.filter((e) => e.difficulty === "hard"),
      seed + 3
    ),
  };

  // Pick with muscle group diversity
  const usedMuscleGroups = new Set<string>();
  const picked: Exercise[] = [
    ...pickExercises(byDifficulty.easy, dist.easy, usedMuscleGroups),
    ...pickExercises(byDifficulty.normal, dist.normal, usedMuscleGroups),
    ...pickExercises(byDifficulty.hard, dist.hard, usedMuscleGroups),
  ];

  // Final shuffle for exercise order
  const finalOrder = seededShuffle(picked, seed + 99);

  // Build generated exercise data with adjusted targets
  const exercises: GeneratedExercise[] = finalOrder.map((ex, i) => ({
    exercise_id: ex.id,
    exercise_name: ex.name,
    unit: ex.unit,
    target: Math.round(ex.base_target * multiplier),
    position: i,
  }));

  return { dayType, exercises };
}
