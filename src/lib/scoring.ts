/**
 * @fileoverview Scoring logic — pure functions, no database access.
 *
 * Scoring is intentionally simple and transparent:
 *   score = clamp(round(actual / target * 100), 0, 100)
 *
 * This means doing exactly your target = 100 points.
 * Doing half = 50 points. Doing 2x = still 100 (capped).
 */

/**
 * Score a single exercise: 0-100 based on actual vs target.
 *
 * @param actual - Reps or seconds the user achieved
 * @param target - The day-adjusted target for this exercise
 * @returns Integer score 0-100
 */
export function scoreExercise(actual: number, target: number): number {
  if (target <= 0) return 0;
  const raw = (actual / target) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

/**
 * Sum exercise scores into a daily total.
 * Max possible = exerciseCount * 100.
 */
export function sumScores(scores: number[]): number {
  return scores.reduce((sum, s) => sum + s, 0);
}

/**
 * Get a qualitative label for a score.
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return "BEAST";
  if (score >= 50) return "SOLID";
  if (score >= 25) return "TRY AGAIN";
  return "WEAK";
}

/**
 * Get a color for a score (for UI styling).
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#e7f900";
  return "#f85149";
}
