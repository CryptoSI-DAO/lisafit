/**
 * @fileoverview Central configuration for LisaFit.
 *
 * All day-type mappings, difficulty distributions, multipliers,
 * and visual config live here. One import, one source of truth.
 */

import type { DayType, ExerciseDifficulty } from "./types";

// ─── Day Schedule ────────────────────────────────────────

/**
 * Maps day of week (0=Sun, 1=Mon, … 6=Sat) to workout intensity.
 *
 * Design rationale:
 *   Mon — normal   (start the week strong)
 *   Tue — tough    (high intensity)
 *   Wed — easy     (active recovery)
 *   Thu — normal   (build)
 *   Fri — tough    (end strong)
 *   Sat — easy     (light)
 *   Sun — rest     (full recovery)
 */
export const DAY_SCHEDULE: Record<number, DayType> = {
  0: "rest",
  1: "normal",
  2: "tough",
  3: "easy",
  4: "normal",
  5: "tough",
  6: "easy",
};

// ─── Day Type Metadata ───────────────────────────────────

type DayTypeMeta = {
  color: string;
  label: string;
  emoji: string;
  exerciseCount: number;
};

/**
 * Full metadata for each day type: colors, labels, emojis,
 * and the number of exercises to generate.
 */
export const DAY_TYPE_CONFIG: Record<DayType, DayTypeMeta> = {
  easy: {
    color: "#22c55e",
    label: "EASY",
    emoji: "🌿",
    exerciseCount: 5,
  },
  normal: {
    color: "#e7f900",
    label: "NORMAL",
    emoji: "🔥",
    exerciseCount: 7,
  },
  tough: {
    color: "#f85149",
    label: "TOUGH",
    emoji: "💀",
    exerciseCount: 10,
  },
  rest: {
    color: "#6366f1",
    label: "REST",
    emoji: "😴",
    exerciseCount: 0,
  },
};

// ─── Difficulty Distribution ─────────────────────────────

type DifficultyDist = Record<ExerciseDifficulty, number>;

/**
 * How many easy/normal/hard exercises to pick per day type.
 * These counts must sum to DAY_TYPE_CONFIG[x].exerciseCount.
 */
export const DIFFICULTY_DISTRIBUTION: Record<DayType, DifficultyDist> = {
  easy: { easy: 3, normal: 2, hard: 0 },
  normal: { easy: 2, normal: 4, hard: 1 },
  tough: { easy: 1, normal: 5, hard: 4 },
  rest: { easy: 0, normal: 0, hard: 0 },
};

// ─── Target Multipliers ──────────────────────────────────

/**
 * Multiplies the exercise base_target based on day intensity.
 * e.g. easy day = 70% of base, tough = 130%.
 */
export const TARGET_MULTIPLIERS: Record<DayType, number> = {
  easy: 0.7,
  normal: 1.0,
  tough: 1.3,
  rest: 0,
};

// ─── Brand Colors ────────────────────────────────────────

export const COLORS = {
  yellow: "#e7f900",
  black: "#0a0a0a",
  bg: "#0a0a0a",
  card: "#161616",
  border: "#2a2a2a",
  muted: "#888888",
  green: "#22c55e",
  red: "#f85149",
  indigo: "#6366f1",
} as const;
