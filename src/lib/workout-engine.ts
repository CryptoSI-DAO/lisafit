/**
 * Daily Workout Generation Engine
 *
 * Determines day type (easy/normal/tough/rest) based on day of week,
 * then selects exercises weighted by difficulty and muscle group diversity.
 *
 * Week structure (Monday-Sunday):
 *   Mon: normal   (start the week strong)
 *   Tue: tough    (high intensity)
 *   Wed: easy     (active recovery)
 *   Thu: normal   (build)
 *   Fri: tough    (end strong)
 *   Sat: easy     (light)
 *   Sun: rest     (full recovery)
 */

export type DayType = "easy" | "normal" | "tough" | "rest";

export type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  unit: string;
  base_target: number;
  difficulty: string;
  description: string | null;
};

export type ExerciseLog = {
  exercise_id: string;
  exercise_name: string;
  unit: string;
  target: number;
  position: number;
};

const DAY_SCHEDULE: Record<number, DayType> = {
  1: "normal", // Monday
  2: "tough", // Tuesday
  3: "easy", // Wednesday
  4: "normal", // Thursday
  5: "tough", // Friday
  6: "easy", // Saturday
  0: "rest", // Sunday
};

export function getDayType(date: Date = new Date()): DayType {
  return DAY_SCHEDULE[date.getDay()] ?? "normal";
}

/**
 * How many exercises per day type
 */
function getExerciseCount(dayType: DayType): number {
  switch (dayType) {
    case "easy":
      return 5;
    case "normal":
      return 7;
    case "tough":
      return 10;
    case "rest":
      return 0;
  }
}

/**
 * Difficulty distribution for each day type
 * e.g. normal = 2 easy, 4 normal, 1 hard
 */
function getDifficultyDistribution(dayType: DayType): {
  easy: number;
  normal: number;
  hard: number;
} {
  switch (dayType) {
    case "easy":
      return { easy: 3, normal: 2, hard: 0 };
    case "normal":
      return { easy: 2, normal: 4, hard: 1 };
    case "tough":
      return { easy: 1, normal: 5, hard: 4 };
    case "rest":
      return { easy: 0, normal: 0, hard: 0 };
  }
}

/**
 * Adjust target reps/time based on day difficulty multiplier
 */
function adjustTarget(baseTarget: number, dayType: DayType): number {
  switch (dayType) {
    case "easy":
      return Math.round(baseTarget * 0.7);
    case "normal":
      return baseTarget;
    case "tough":
      return Math.round(baseTarget * 1.3);
    case "rest":
      return 0;
  }
}

/**
 * Seeded random shuffle (deterministic per date)
 * Same date = same workout for all users that day
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let m = result.length;
  let t: T;
  let i: number;

  // Simple LCG seeded random
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
 * Convert a date to a numeric seed
 */
function dateToSeed(date: Date): number {
  return (
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate()
  );
}

/**
 * Generate a workout for a specific date
 */
export function generateWorkout(
  allExercises: Exercise[],
  date: Date = new Date()
): { dayType: DayType; exercises: ExerciseLog[] } {
  const dayType = getDayType(date);
  const count = getExerciseCount(dayType);

  if (dayType === "rest" || count === 0) {
    return { dayType: "rest", exercises: [] };
  }

  const dist = getDifficultyDistribution(dayType);
  const seed = dateToSeed(date);

  // Group exercises by difficulty
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

  // Pick exercises ensuring muscle group diversity
  const picked: Exercise[] = [];
  const usedMuscleGroups: string[] = [];

  const pickFromGroup = (
    pool: Exercise[],
    n: number
  ): Exercise[] => {
    const result: Exercise[] = [];
    for (const ex of pool) {
      if (result.length >= n) break;
      // Prefer exercises from unused muscle groups
      if (!usedMuscleGroups.includes(ex.muscle_group) || result.length === 0) {
        result.push(ex);
        if (!usedMuscleGroups.includes(ex.muscle_group)) {
          usedMuscleGroups.push(ex.muscle_group);
        }
      }
    }
    // If we didn't get enough (muscle group constraint), just fill
    if (result.length < n) {
      for (const ex of pool) {
        if (result.length >= n) break;
        if (!result.includes(ex)) result.push(ex);
      }
    }
    return result;
  };

  picked.push(...pickFromGroup(byDifficulty.easy, dist.easy));
  picked.push(...pickFromGroup(byDifficulty.normal, dist.normal));
  picked.push(...pickFromGroup(byDifficulty.hard, dist.hard));

  // Final shuffle for exercise order
  const finalOrder = seededShuffle(picked, seed + 99);

  // Build exercise logs with adjusted targets
  const exercises: ExerciseLog[] = finalOrder.map((ex, i) => ({
    exercise_id: ex.id,
    exercise_name: ex.name,
    unit: ex.unit,
    target: adjustTarget(ex.base_target, dayType),
    position: i,
  }));

  return { dayType, exercises };
}
